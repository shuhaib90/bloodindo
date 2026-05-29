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

      // 1. Handle Contact Sharing (Direct Fast-Link Shortcut)
      if (message.contact) {
        const phoneNumber = message.contact.phone_number;
        console.log(`[Telegram Worker] Received contact phone: ${phoneNumber} for chat: ${chatId}`);

        const result = db.linkTelegramByPhone(phoneNumber, chatId);

        if (result.success) {
          const successText = `🎉 <b>Account Connected!</b>\n\nWelcome, <b>${result.name}</b>. Your Blood Indo website account is now linked with this Telegram account.\n\n${mustReadGuidelines}`;
          
          await db.sendTelegramMessage(chatId, successText);
          console.log(`[Telegram Worker] Successfully linked account for ${result.name}`);

          sessions.delete(chatId); // Clear any conversational session
          window.dispatchEvent(new Event('telegram-status-updated'));
        } else {
          const failText = `❌ <b>Registration Failed</b>\n\nWe couldn't find a Blood Indo profile with the phone number <b>${phoneNumber}</b>.\n\nPlease log in to the website, complete your profile details with this phone number, and try again!`;
          
          await db.sendTelegramMessage(chatId, failText);
          console.log(`[Telegram Worker] Linking failed for phone ${phoneNumber}`);
        }
        return;
      }

      // 2. Handle Conversational Chat Toggles
      let session = sessions.get(chatId);

      // Welcome Command
      if (text.startsWith('/start')) {
        sessions.set(chatId, { step: 'awaiting_phone' });
        
        const welcomeText = `👋 <b>Welcome to the Blood Indo Alerts Bot!</b>\n\nI will help you link your account so you can receive instant emergency blood requests in your area.\n\n💬 <b>Step 1:</b> Please type your **Registered Phone Number** (e.g. <code>+91 9876543210</code> or <code>9876543210</code>).\n\n<i>Or, click the button below to share your contact instantly!</i>`;
        
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            parse_mode: 'HTML',
            reply_markup: {
              keyboard: [
                [
                  {
                    text: 'Share Contact 📱',
                    request_contact: true
                  }
                ]
              ],
              one_time_keyboard: true,
              resize_keyboard: true
            }
          })
        });
        return;
      }

      // Step 1: Awaiting Phone Number via Text
      if (session && session.step === 'awaiting_phone') {
        const normalize = (p: string) => p.replace(/\\D/g, '').slice(-10);
        const target = normalize(text);
        
        if (!target) {
          await db.sendTelegramMessage(chatId, "❌ <b>Invalid Number Format</b>\n\nPlease enter a valid phone number containing digits.");
          return;
        }

        // Search profile or donors
        const profile = db.getUserProfile();
        let found: any = null;

        if (profile && profile.phone && normalize(profile.phone) === target) {
          found = profile;
        } else {
          const donors = db.getDonors();
          const donor = donors.find(d => d.phone && normalize(d.phone) === target);
          if (donor) {
            found = donor;
          }
        }

        if (found) {
          session.step = 'awaiting_name';
          session.phone = text;
          session.profile = found;
          sessions.set(chatId, session);

          await db.sendTelegramMessage(chatId, `🔍 <b>Account Found!</b>\n\nTo confirm your identity, <b>Step 2:</b> Please type your **Full Name** exactly as registered on Blood Indo.`);
        } else {
          await db.sendTelegramMessage(chatId, `❌ <b>Registration Failed</b>\n\nWe couldn't find a Blood Indo profile with the phone number <b>${text}</b>.\n\nPlease check your number or log in to the website, complete your profile, and try again!`);
        }
        return;
      }

      // Step 2: Awaiting Name via Text
      if (session && session.step === 'awaiting_name') {
        const nameInput = text.toLowerCase().replace(/\\s+/g, '');
        const actualName = session.profile.name.toLowerCase().replace(/\\s+/g, '').replace('(you)', '').trim();

        if (nameInput === actualName || actualName.includes(nameInput) || nameInput.includes(actualName)) {
          // Link telegram account
          const targetProfile = db.getUserProfile();
          const normalize = (p: string) => p.replace(/\\D/g, '').slice(-10);
          
          if (targetProfile && targetProfile.phone && normalize(targetProfile.phone) === normalize(session.phone || '')) {
            targetProfile.telegramChatId = chatId;
            db.saveUserProfile(targetProfile);
          } else {
            const donors = db.getDonors();
            const donorIndex = donors.findIndex(d => d.phone && normalize(d.phone) === normalize(session.phone || ''));
            if (donorIndex !== -1) {
              donors[donorIndex].telegramChatId = chatId;
              db.saveDonors(donors);
            }
          }

          const successText = `🎉 <b>Verification Successful!</b>\n\nWelcome, <b>${session.profile.name}</b>! Your Blood Indo account has been connected to this Telegram alert bot.\n\n${mustReadGuidelines}`;
          
          await db.sendTelegramMessage(chatId, successText);
          sessions.delete(chatId); // Clear session

          window.dispatchEvent(new Event('telegram-status-updated'));
        } else {
          await db.sendTelegramMessage(chatId, `❌ <b>Name Verification Failed</b>\n\nThe name <b>${text}</b> does not match the registered name for this phone number.\n\nPlease type your **Full Name** exactly as registered on your profile page to confirm your identity.`);
        }
        return;
      }
    };

    deleteWebhookAndStart();

    return () => {
      console.log('[Telegram Worker] Cleaning up background polling...');
      isPollingRef.current = false;
    };
  }, []);

  return null; // Silent background worker
}
