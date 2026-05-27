import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[Telegram Webhook] Received body:', JSON.stringify(body));

    const message = body.message;
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || '';

    if (!botToken) {
      console.warn('[Telegram Webhook] No Telegram Bot Token configured. Unable to send responses.');
      return NextResponse.json({ ok: false, error: 'No token configured' }, { status: 500 });
    }

    // 1. Handle Contact Sharing
    if (message.contact) {
      const phoneNumber = message.contact.phone_number;
      
      // Link account
      const result = db.linkTelegramByPhone(phoneNumber, chatId.toString());

      if (result.success) {
        const text = `✅ <b>Account Connected!</b>\n\nWelcome, <b>${result.name}</b>. Your Blood Indo website account is now linked with this Telegram account.\n\nYou will automatically receive real-time notifications whenever a patient matches your blood group!`;
        
        await db.sendTelegramMessage(chatId.toString(), text);
        console.log(`[Telegram Webhook] Linked account successfully for ${result.name}`);

      } else {
        const text = `❌ <b>Registration Failed</b>\n\nWe couldn't find a Blood Indo profile with the phone number <b>${phoneNumber}</b>.\n\nPlease log in to the website, complete your profile details with this phone number, and try again!`;
        
        await db.sendTelegramMessage(chatId.toString(), text);
        console.log(`[Telegram Webhook] Linking failed for phone ${phoneNumber}`);
      }

      return NextResponse.json({ ok: true });
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
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram Webhook Error]:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
