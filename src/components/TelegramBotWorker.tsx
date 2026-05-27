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

      const chatId = message.chat.id;

      // 1. Handle Contact Sharing
      if (message.contact) {
        const phoneNumber = message.contact.phone_number;
        console.log(`[Telegram Worker] Received contact phone: ${phoneNumber} for chat: ${chatId}`);

        const result = db.linkTelegramByPhone(phoneNumber, chatId.toString());

        if (result.success) {
          const text = `✅ <b>Account Connected!</b>\n\nWelcome, <b>${result.name}</b>. Your Blood Indo website account is now linked with this Telegram account.\n\nYou will automatically receive real-time notifications whenever a patient matches your blood group!`;
          
          await db.sendTelegramMessage(chatId.toString(), text);
          console.log(`[Telegram Worker] Successfully linked account for ${result.name}`);

          // Dispatch events locally to sync all browser components instantly
          window.dispatchEvent(new Event('telegram-status-updated'));
        } else {
          const text = `❌ <b>Registration Failed</b>\n\nWe couldn't find a Blood Indo profile with the phone number <b>${phoneNumber}</b>.\n\nPlease log in to the website, complete your profile details with this phone number, and try again!`;
          
          await db.sendTelegramMessage(chatId.toString(), text);
          console.log(`[Telegram Worker] Linking failed for phone ${phoneNumber}`);
        }
        return;
      }

      // 2. Handle Text Commands
      const text = message.text || '';
      if (text.startsWith('/start')) {
        const welcomeText = `🩸 <b>Blood Indo Alert System</b> 🩸\n\nPlease share your phone number to connect your Blood Indo account and receive instant matching notifications.`;
        
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
                    text: 'Share Contact 📞',
                    request_contact: true
                  }
                ]
              ],
              one_time_keyboard: true,
              resize_keyboard: true
            }
          })
        });
        console.log(`[Telegram Worker] Replied to /start command for chat ${chatId}`);
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
