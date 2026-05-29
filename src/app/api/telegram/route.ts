import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

async function sendTelegramMessage(chatId: string, text: string, botToken: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id.toString();
    const text = (message.text || '').trim().toUpperCase();
    const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || '';

    if (!botToken) {
      return NextResponse.json({ ok: false, error: 'No token configured' }, { status: 500 });
    }

    // Handle /start command
    if (text.startsWith('/START')) {
      const welcomeText = `🛡 <b>Blood Indo Alert System</b>\n\nTo connect your account, please:\n\n1️⃣ Open your Blood Indo dashboard\n2️⃣ Go to the <b>Connect Telegram</b> section\n3️⃣ Click <b>"Generate Code"</b>\n4️⃣ Send the code here (e.g. <code>BLOOD-847291</code>)\n\nYour code expires in 10 minutes.`;
      await sendTelegramMessage(chatId, welcomeText, botToken);
      return NextResponse.json({ ok: true });
    }

    // Handle BLOOD-XXXXXX verification code
    const codeMatch = text.match(/^BLOOD-?(\d{6})$/);
    if (codeMatch) {
      const code = codeMatch[1];
      const fullCode = `BLOOD-${code}`;

      // Check if this Telegram account is already linked to another user
      const { data: existingLink } = await supabase
        .from('bloodindo_profiles')
        .select('id, name')
        .eq('telegram_chat_id', chatId)
        .maybeSingle();

      if (existingLink) {
        await sendTelegramMessage(chatId, `⚠️ <b>Already Connected</b>\n\nThis Telegram account is already linked to <b>${existingLink.name}</b>.\n\nTo link a different account, first disconnect from your Blood Indo dashboard.`, botToken);
        return NextResponse.json({ ok: true });
      }

      // Find the profile with this pending verification code
      const { data: matchedProfiles, error: fetchError } = await supabase
        .from('bloodindo_profiles')
        .select('*')
        .like('telegram_chat_id', `CODE:${fullCode}%`);

      if (fetchError) {
        console.error('[Telegram API] Supabase fetch error:', fetchError);
        await sendTelegramMessage(chatId, `⛔ <b>System Error</b>\n\nFailed to verify code. Please try again shortly.`, botToken);
        return NextResponse.json({ ok: true });
      }

      if (!matchedProfiles || matchedProfiles.length === 0) {
        await sendTelegramMessage(chatId, `❌ <b>Invalid or Expired Code</b>\n\nThe code <code>${fullCode}</code> was not found or has expired.\n\nPlease generate a new code from your Blood Indo dashboard.`, botToken);
        return NextResponse.json({ ok: true });
      }

      const matchedProfile = matchedProfiles[0];
      const parts = matchedProfile.telegram_chat_id.split(':');
      const expiry = parseInt(parts[2] || '0');

      // Check expiry
      if (expiry && Date.now() > expiry) {
        // Code expired - clear it
        await supabase
          .from('bloodindo_profiles')
          .update({ telegram_chat_id: null })
          .eq('id', matchedProfile.id);

        await sendTelegramMessage(chatId, `⏰ <b>Code Expired</b>\n\nYour verification code has expired. Please generate a new code from your Blood Indo dashboard.`, botToken);
        return NextResponse.json({ ok: true });
      }

      // Success! Link the Telegram account
      const { error: updateError } = await supabase
        .from('bloodindo_profiles')
        .update({
          telegram_chat_id: chatId,
          available_to_donate: true
        })
        .eq('id', matchedProfile.id);

      if (updateError) {
        console.error('[Telegram API] Supabase update error:', updateError);
        await sendTelegramMessage(chatId, `⛔ <b>System Error</b>\n\nFailed to link your account. Please try again.`, botToken);
        return NextResponse.json({ ok: true });
      }

      const mustReadGuidelines = `📖 <b>MUST READ: EMERGENCY GUIDELINES</b>\n\n1️⃣ <b>Speed Saves Lives:</b> When you receive a blood request alert matching your blood group, review it immediately. Every minute matters in severe critical ICUs!\n2️⃣ <b>Privacy Shield:</b> We redact patient & hospital details from the public feed on received requests to secure donor and patient privacy.\n3️⃣ <b>Be Ready & Online:</b> Ensure your status is set to 'Active (Ready to Donate)' on your dashboard to appear on nearby radars.\n4️⃣ <b>Community First:</b> Never request or accept financial compensation for donating blood. Donation is a pure lifesaver's duty.\n\nStay alert. You are now officially a Blood Indo Lifesaver!`;

      const successText = `✅ <b>Telegram connected successfully. You will now receive emergency blood alerts.</b>\n\nWelcome, <b>${matchedProfile.name}</b>!\n\n${mustReadGuidelines}`;
      await sendTelegramMessage(chatId, successText, botToken);

      console.log(`[Telegram API] Successfully linked chatId ${chatId} to ${matchedProfile.name}`);
      return NextResponse.json({ ok: true });
    }

    // Fallback for unrecognized messages
    await sendTelegramMessage(chatId, `💬 Please send your verification code (e.g. <code>BLOOD-847291</code>) to connect your Blood Indo account.\n\nSend /start for instructions.`, botToken);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram Webhook Error]:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
