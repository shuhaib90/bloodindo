"use client";

import { useEffect, useRef } from 'react';
import { db } from '../lib/db';

export default function TelegramBotWorker() {
  const isPollingRef = useRef(false);
  const offsetRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || '';
    if (!token) {
      console.warn('[Telegram Worker] No Telegram Bot Token configured. Polling disabled.');
      return;
    }

    console.log('[Telegram Worker] Background worker initialized. Starting polling...');

    const deleteWebhookAndStart = async () => {
      try {
        await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
        console.log('[Telegram Worker] Cleared existing webhooks. Initiating long-polling...');
        isPollingRef.current = true;
        pollUpdates();
      } catch (e) {
        console.error('[Telegram Worker] Error clearing webhook:', e);
        isPollingRef.current = true;
        pollUpdates();
      }
    };

    const pollUpdates = async () => {
      if (!isPollingRef.current) return;

      try {
        const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${offsetRef.current}&timeout=10`;
        const res = await fetch(url);

        if (!res.ok) throw new Error(`Telegram API status ${res.status}`);

        const data = await res.json();

        if (data.ok && data.result && data.result.length > 0) {
          for (const update of data.result) {
            offsetRef.current = update.update_id + 1;
            await handleUpdate(update, token);
          }
        }
      } catch (err) {
        console.error('[Telegram Worker] Long polling loop error:', err);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      if (isPollingRef.current) {
        pollUpdates();
      }
    };

    const handleUpdate = async (update: any, botToken: string) => {
      const message = update.message;
      if (!message) return;

      const chatId = message.chat.id.toString();
      const rawText = (message.text || '').trim();
      const text = rawText.toUpperCase();

      const mustReadGuidelines = `📖 <b>MUST READ: EMERGENCY GUIDELINES</b>\n\n1️⃣ <b>Speed Saves Lives:</b> When you receive a blood request alert matching your blood group, review it immediately. Every minute matters in severe critical ICUs!\n2️⃣ <b>Privacy Shield:</b> We redact patient & hospital details from the public feed on received requests to secure donor and patient privacy.\n3️⃣ <b>Be Ready & Online:</b> Ensure your status is set to 'Active (Ready to Donate)' on your dashboard to appear on nearby radars.\n4️⃣ <b>Community First:</b> Never request or accept financial compensation for donating blood. Donation is a pure lifesaver's duty.\n\nStay alert. You are now officially a Bloodundo Lifesaver!`;

      // /start command
      if (text.startsWith('/START')) {
        const welcomeText = `🛡 <b>Welcome to the Bloodundo Alerts Bot!</b>\n\nTo connect your account:\n\n1️⃣ Open your Bloodundo website dashboard\n2️⃣ Go to the <b>Connect Telegram</b> section\n3️⃣ Click <b>"Generate Code"</b>\n4️⃣ Copy the code and send it here\n\nExample: <code>BLOOD-847291</code>\n\nYour code expires in 10 minutes.`;
        await db.sendTelegramMessage(chatId, welcomeText);
        return;
      }

      // Handle BLOOD-XXXXXX verification code
      const codeMatch = text.match(/^BLOOD-?(\d{6})$/);
      if (codeMatch) {
        const code = codeMatch[1];
        const fullCode = `BLOOD-${code}`;

        try {
          const { supabase } = await import('../lib/supabase');

          // Prevent linking same Telegram account to multiple users
          const { data: existingLink } = await supabase
            .from('bloodindo_profiles')
            .select('id, name')
            .eq('telegram_chat_id', chatId)
            .maybeSingle();

          if (existingLink) {
            await db.sendTelegramMessage(chatId, `⚠️ <b>Already Connected</b>\n\nThis Telegram account is already linked to <b>${existingLink.name}</b>.\n\nTo link a different account, first disconnect from your Bloodundo dashboard.`);
            return;
          }

          // Find the profile with this pending code
          // Code is stored inside telegram_chat_id as "CODE:BLOOD-XXXXXX:EXPIRY"
          // We can query all profiles starting with CODE:BLOOD-XXXXXX
          const { data: matchedProfiles, error: fetchError } = await supabase
            .from('bloodindo_profiles')
            .select('*')
            .like('telegram_chat_id', `CODE:${fullCode}%`);

          if (fetchError) throw fetchError;

          if (!matchedProfiles || matchedProfiles.length === 0) {
            await db.sendTelegramMessage(chatId, `❌ <b>Invalid or Expired Code</b>\n\nThe code <code>​${fullCode}</code> was not found or has expired.\n\nPlease generate a new code from your Bloodundo dashboard.`);
            return;
          }

          const matchedProfile = matchedProfiles[0];
          const parts = matchedProfile.telegram_chat_id.split(':');
          const expiry = parseInt(parts[2] || '0');

          // Check code expiry
          if (expiry && Date.now() > expiry) {
            // Clear expired code
            await supabase
              .from('bloodindo_profiles')
              .update({ telegram_chat_id: null })
              .eq('id', matchedProfile.id);

            await db.sendTelegramMessage(chatId, `⏰ <b>Code Expired</b>\n\nYour verification code has expired. Please generate a new code from your Bloodundo dashboard.`);
            return;
          }

          // Success - link account
          const { error: updateError } = await supabase
            .from('bloodindo_profiles')
            .update({
              telegram_chat_id: chatId,
              available_to_donate: true
            })
            .eq('id', matchedProfile.id);

          if (updateError) throw updateError;

          // Sync local browser state if this is the active user
          const localProfile = db.getUserProfile();
          const normalize = (p: string): string => p.replace(/\D/g, '').slice(-10);

          if (localProfile && localProfile.phone && matchedProfile.phone && normalize(localProfile.phone) === normalize(matchedProfile.phone)) {
            localProfile.telegramChatId = chatId;
            localProfile.availableToDonate = true;
            db.saveUserProfile(localProfile);
          }

          const successText = `✅ <b>Telegram connected successfully. You will now receive emergency blood alerts.</b>\n\nWelcome, <b>${matchedProfile.name}</b>!\n\n${mustReadGuidelines}`;
          await db.sendTelegramMessage(chatId, successText);

          console.log(`[Telegram Worker] Linked chatId ${chatId} for ${matchedProfile.name}`);
          window.dispatchEvent(new Event('telegram-status-updated'));
        } catch (err) {
          console.error('[Telegram Worker] Verification error:', err);
          await db.sendTelegramMessage(chatId, `⛔ <b>System Error</b>\n\nFailed to verify code. Please try again shortly.`);
        }
        return;
      }

      // Fallback
      await db.sendTelegramMessage(chatId, `💬 Please send your verification code (e.g. <code>BLOOD-847291</code>) to connect your account.\n\nSend /start for instructions.`);
    };

    deleteWebhookAndStart();

    return () => {
      console.log('[Telegram Worker] Cleaning up background polling...');
      isPollingRef.current = false;
    };
  }, []);

  return null;
}
