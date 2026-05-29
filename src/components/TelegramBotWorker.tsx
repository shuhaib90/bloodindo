"use client";

import { useEffect, useRef } from 'react';
import { db } from '../lib/db';

// Module-level state map to track conversation steps for each Telegram user session
const sessions = new Map<string, { step: 'awaiting_phone' | 'awaiting_name'; phone?: string; profile?: any }>();

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

    console.log('[Telegram Worker] Background worker initialized. Starting polling for real Telegram bot...');

    const deleteWebhookAndStart = async () => {
      try {
        // Clear any existing webhooks first to ensure getUpdates polling works
        await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
        console.log('[Telegram Worker] Cleared existing webhooks. Initiating long-polling...');
        
        isPollingRef.current = true;
        pollUpdates();
      } catch (e) {
        console.error('[Telegram Worker] Error clearing webhook:', e);
        // Start polling anyway as a fallback
        isPollingRef.current = true;
        pollUpdates();
      }
    };

    const pollUpdates = async () => {
      if (!isPollingRef.current) return;

      try {
        const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${offsetRef.current}&timeout=10`;
        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error(`Telegram API status ${res.status}`);
        }

        const data = await res.json();
        
        if (data.ok && data.result && data.result.length > 0) {
          for (const update of data.result) {
            offsetRef.current = update.update_id + 1;
            await handleUpdate(update, token);
          }
        }
      } catch (err) {
        console.error('[Telegram Worker] Long polling loop error:', err);
        // Wait a few seconds before retrying on network error
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      // Schedule next poll immediately
      if (isPollingRef.current) {
        pollUpdates();
      }
    };

    const handleUpdate = async (update: any, botToken: string) => {
      const message = update.message;
      if (!message) return;

      const chatId = message.chat.id.toString();
      const text = (message.text || '').trim();

      const mustReadGuidelines = `📚 <b>MUST READ: EMERGENCY GUIDELINES</b>\n\n1️⃣ <b>Speed Saves Lives:</b> When you receive a blood request alert matching your blood group, review it immediately. Every minute matters in severe critical ICUs!\n2️⃣ <b>Privacy Shield:</b> We redact patient & hospital details from the public feed on received requests to secure donor and patient privacy.\n3️⃣ <b>Be Ready & Online:</b> Ensure your status is set to 'Active (Ready to Donate)' on your dashboard to appear on nearby radars.\n4️⃣ <b>Community First:</b> Never request or accept financial compensation for donating blood. Donation is a pure lifesaver's duty.\n\nStay alert. You are now officially a Blood Indo Lifesaver! 🦸‍♂️🏥❤️`;

      // Welcome Command
      if (text.startsWith('/start')) {
        const welcomeText = `👋 <b>Welcome to the Blood Indo Alerts Bot!</b>\n\nI will help you link your account so you can receive instant emergency blood requests in your area.\n\n🔑 <b>How to activate:</b>\n1. Open your website dashboard page.\n2. Click <b>"Generate Activation Code"</b>.\n3. Send that 6-digit code to this bot!\n\nYour account will link instantly! 🎉`;
        await db.sendTelegramMessage(chatId, welcomeText);
        return;
      }

      // Check if the user sent a 6-digit code
      const isSixDigitCode = /^\\d{6}$/.test(text);
      if (isSixDigitCode) {
        // Query database profiles table to find the user with this pending connection code
        // We use the supabase client directly for security and robust instant cloud updates
        const { supabase } = require('../lib/supabase');
        
        try {
          const { data: matchedProfiles, error: fetchError } = await supabase
            .from('bloodindo_profiles')
            .select('*')
            .eq('telegram_chat_id', 'CODE:' + text);

          if (fetchError) throw fetchError;

          if (matchedProfiles && matchedProfiles.length > 0) {
            const profile = matchedProfiles[0];
            
            // Link this Telegram account in Supabase
            const { error: updateError } = await supabase
              .from('bloodindo_profiles')
              .update({
                telegram_chat_id: chatId,
                available_to_donate: true // Automatically set donor status to online/active on Telegram link!
              })
              .eq('id', profile.id);

            if (updateError) throw updateError;

            // Sync the updated state locally inside the browser memory if this matches the active user
            const localProfile = db.getUserProfile();
            const normalize = (p: string) => p.replace(/\\D/g, '').slice(-10);
            
            if (localProfile && localProfile.phone && profile.phone && normalize(localProfile.phone) === normalize(profile.phone)) {
              localProfile.telegramChatId = chatId;
              localProfile.availableToDonate = true;
              db.saveUserProfile(localProfile);
            }

            // Send successful response with must-read guidelines
            const successText = `🎉 <b>Verification Successful!</b>\n\nWelcome, <b>${profile.name}</b>! Your Blood Indo account has been connected to this Telegram alert bot.\n\n${mustReadGuidelines}`;
            await db.sendTelegramMessage(chatId, successText);
            
            console.log(`[Telegram Worker] Conversational code verified. Linked chatId ${chatId} for ${profile.name}`);
            window.dispatchEvent(new Event('telegram-status-updated'));
          } else {
            await db.sendTelegramMessage(chatId, `❌ <b>Invalid or Expired Code</b>\n\nWe couldn't find a pending registration matching the code <b>${text}</b>.\n\nPlease check the code on your website dashboard and send it again, or generate a new activation code!`);
          }
        } catch (err) {
          console.error('[Telegram Worker] Verification error:', err);
          await db.sendTelegramMessage(chatId, "⚠️ <b>System Error</b>\n\nFailed to verify code due to a database sync failure. Please try again shortly.");
        }
        return;
      }

      // Fallback response for unhandled text
      await db.sendTelegramMessage(chatId, "💬 Please send your 6-digit connection code generated from the website dashboard to connect your account! (Or send /start to read instructions).");
    };

    deleteWebhookAndStart();

    return () => {
      console.log('[Telegram Worker] Cleaning up background polling...');
      isPollingRef.current = false;
    };
  }, []);

  return null; // Silent background worker
}
