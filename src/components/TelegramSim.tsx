"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, Smartphone, ShieldCheck, RefreshCw, ExternalLink } from 'lucide-react';
import { db } from '../lib/db';

interface Message {
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export default function TelegramSim() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: '👋 <b>Welcome to the Blood Indo Alerts Bot!</b>\n\nI will help you link your account so you can receive instant emergency blood requests in your area.\n\n💬 <b>Step 1:</b> Please type your **Registered Phone Number** (e.g. <code>+91 9876543210</code> or <code>9876543210</code>).',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLinked, setIsLinked] = useState(false);
  const [step, setStep] = useState<'awaiting_phone' | 'awaiting_name' | 'linked'>('awaiting_phone');
  const [tempPhone, setTempPhone] = useState('');
  const [matchedProfile, setMatchedProfile] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const mustReadGuidelines = `🎉 <b>Verification Successful!</b>\n\nYour Blood Indo account is connected to this Telegram alert bot.\n\n📚 <b>MUST READ: EMERGENCY GUIDELINES</b>\n\n1️⃣ <b>Speed Saves Lives:</b> When you receive a blood request alert matching your blood group, review it immediately. Every minute matters in severe critical ICUs!\n2️⃣ <b>Privacy Shield:</b> We redact patient & hospital details from the public feed on received requests to secure donor and patient privacy.\n3️⃣ <b>Be Ready & Online:</b> Ensure your status is set to 'Active (Ready to Donate)' on your dashboard to appear on nearby radars.\n4️⃣ <b>Community First:</b> Never request or accept financial compensation for donating blood. Donation is a pure lifesaver's duty.\n\nStay alert. You are now officially a Blood Indo Lifesaver! 🦸‍♂️🏥❤️`;

  const fetchProfile = () => {
    const profile = db.getUserProfile();
    setUserProfile(profile);
    if (profile && profile.telegramChatId) {
      setIsLinked(true);
      setStep('linked');
      setMessages([
        {
          sender: 'bot',
          text: `🎉 <b>Account Active!</b>\n\nWelcome back, <b>${profile.name}</b>.\n\n${mustReadGuidelines}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      setIsLinked(false);
      setStep('awaiting_phone');
    }
  };

  useEffect(() => {
    fetchProfile();

    const handleSync = () => {
      fetchProfile();
    };

    // Listen to local matching notifications
    const handleNewRequest = (e: Event) => {
      const req = (e as CustomEvent).detail;
      const profile = db.getUserProfile();
      
      if (profile && profile.telegramChatId && db.isCompatible(profile.bloodGroup as any, req.bloodGroup)) {
        const text = `🚨 <b>NEW MATCHING EMERGENCY</b> 🚨\n\n` +
          `A patient needs <b>${req.bloodGroup}</b> blood immediately!\n\n` +
          `• <b>Patient:</b> ${req.patientName}\n` +
          `• <b>Hospital:</b> ${req.hospitalName}\n` +
          `• <b>Location:</b> ${req.hospitalLocation || 'N/A'}\n` +
          `• <b>Urgency:</b> ${req.urgencyLevel}\n` +
          `• <b>Required Units:</b> ${req.unitsNeeded}\n` +
          `${req.notes ? `• <b>Notes:</b> ${req.notes}\n` : ''}\n` +
          `Please open Blood Indo to volunteer and save a life!`;

        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    };

    // Listen to direct manual dispatches
    const handleDirectDispatch = (e: Event) => {
      const data = (e as CustomEvent).detail;
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    };

    window.addEventListener('new-blood-request-created', handleNewRequest);
    window.addEventListener('telegram-message-dispatched-sim', handleDirectDispatch);
    window.addEventListener('telegram-status-updated', handleSync);

    return () => {
      window.removeEventListener('new-blood-request-created', handleNewRequest);
      window.removeEventListener('telegram-message-dispatched-sim', handleDirectDispatch);
      window.removeEventListener('telegram-status-updated', handleSync);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setInputText('');

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message to feed
    setMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: userMsg,
        timestamp: timeString
      }
    ]);

    // Simulate bot response after organic delay
    setTimeout(() => {
      const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (step === 'awaiting_phone') {
        const normalize = (p: string) => p.replace(/\\D/g, '').slice(-10);
        const target = normalize(userMsg);
        
        if (!target) {
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: "❌ <b>Invalid Number Format</b>\n\nPlease enter a valid phone number containing digits.",
              timestamp: responseTime
            }
          ]);
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
          setStep('awaiting_name');
          setTempPhone(userMsg);
          setMatchedProfile(found);
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `🔍 <b>Account Found!</b>\n\nTo confirm your identity, <b>Step 2:</b> Please type your **Full Name** exactly as registered on Blood Indo.`,
              timestamp: responseTime
            }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `❌ <b>Registration Failed</b>\n\nWe couldn't find a Blood Indo profile with the phone number <b>${userMsg}</b>.\n\nPlease type a valid registered phone number, or log in to the website, complete your profile, and try again!`,
              timestamp: responseTime
            }
          ]);
        }
      } 
      
      else if (step === 'awaiting_name') {
        const nameInput = userMsg.toLowerCase().replace(/\\s+/g, '');
        const actualName = matchedProfile.name.toLowerCase().replace(/\\s+/g, '').replace('(you)', '').trim();

        if (nameInput === actualName || actualName.includes(nameInput) || nameInput.includes(actualName)) {
          // Link telegram account
          const targetProfile = db.getUserProfile();
          const normalize = (p: string) => p.replace(/\\D/g, '').slice(-10);
          
          if (targetProfile && targetProfile.phone && normalize(targetProfile.phone) === normalize(tempPhone)) {
            targetProfile.telegramChatId = '999999'; // Simulated chatId
            db.saveUserProfile(targetProfile);
          } else {
            const donors = db.getDonors();
            const donorIndex = donors.findIndex(d => d.phone && normalize(d.phone) === normalize(tempPhone));
            if (donorIndex !== -1) {
              donors[donorIndex].telegramChatId = '999999';
              db.saveDonors(donors);
            }
          }

          setStep('linked');
          setIsLinked(true);
          
          const successText = `🎉 <b>Verification Successful!</b>\n\nWelcome, <b>${matchedProfile.name}</b>! Your Blood Indo account has been connected to this Telegram alert bot.\n\n📚 <b>MUST READ: EMERGENCY GUIDELINES</b>\n\n1️⃣ <b>Speed Saves Lives:</b> When you receive a blood request alert matching your blood group, review it immediately. Every minute matters in severe critical ICUs!\n2️⃣ <b>Privacy Shield:</b> We redact patient & hospital details from the public feed on received requests to secure donor and patient privacy.\n3️⃣ <b>Be Ready & Online:</b> Ensure your status is set to 'Active (Ready to Donate)' on your dashboard to appear on nearby radars.\n4️⃣ <b>Community First:</b> Never request or accept financial compensation for donating blood. Donation is a pure lifesaver's duty.\n\nStay alert. You are now officially a Blood Indo Lifesaver! 🦸‍♂️🏥❤️`;

          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: successText,
              timestamp: responseTime
            }
          ]);

          window.dispatchEvent(new Event('telegram-status-updated'));
        } else {
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `❌ <b>Name Verification Failed</b>\n\nThe name <b>${userMsg}</b> does not match the registered name for this phone number.\n\nPlease type your **Full Name** exactly as registered on your profile page to confirm your identity.`,
              timestamp: responseTime
            }
          ]);
        }
      }
    }, 800);
  };

  const handleResetSim = () => {
    const profile = db.getUserProfile();
    if (profile) {
      const updated = { ...profile, telegramChatId: '' };
      db.saveUserProfile(updated);
      setIsLinked(false);
      setStep('awaiting_phone');
      setMessages([
        {
          sender: 'bot',
          text: '👋 <b>Welcome to the Blood Indo Alerts Bot!</b>\n\nI will help you link your account so you can receive instant emergency blood requests in your area.\n\n💬 <b>Step 1:</b> Please type your **Registered Phone Number** (e.g. <code>+91 9876543210</code> or <code>9876543210</code>).',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      window.dispatchEvent(new Event('telegram-status-updated'));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      {/* Phone Mockup Frame */}
      <div className="relative w-full max-w-[340px] h-[580px] bg-zinc-950 border-[6px] border-zinc-800 rounded-[36px] shadow-2xl shadow-red-950/20 overflow-hidden flex flex-col">
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-zinc-800 rounded-b-xl z-20" />

        {/* Telegram Header */}
        <div className="bg-[#182533] px-4 pt-6 pb-3 flex items-center gap-3 border-b border-zinc-900 shadow-md">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center font-bold text-white text-xs">
            BI
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-outfit">Blood Indo Alerts</h4>
            <p className="text-[10px] text-zinc-400">bot</p>
          </div>
          {isLinked && (
            <button 
              onClick={handleResetSim} 
              className="ml-auto p-1 bg-zinc-800/80 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 rounded-md transition-all"
              title="Reset linking"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Chat Feed */}
        <div className="flex-1 bg-[#0e1621] p-3 overflow-y-auto space-y-3 flex flex-col scrollbar-thin">
          {messages.map((msg, index) => (
            <div 
              key={index}
              className={`flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'bot' 
                  ? 'bg-[#182533] text-zinc-200 border border-zinc-800 rounded-tl-none self-start'
                  : 'bg-[#2b5278] text-white rounded-tr-none self-end'
              }`}
            >
              <div 
                dangerouslySetInnerHTML={{ __html: msg.text }} 
                className="whitespace-pre-line text-[11px]"
              />
              <span className="text-[9px] text-zinc-400/80 self-end mt-1.5">{msg.timestamp}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Bottom Actions Area */}
        <div className="bg-[#182533] p-2.5 border-t border-zinc-900 flex flex-col gap-2">
          {step !== 'linked' ? (
            <div className="flex flex-col gap-2">
              <form onSubmit={handleSendMessage} className="flex gap-1.5">
                <input
                  type="text"
                  required
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={step === 'awaiting_phone' ? "Enter registered phone..." : "Enter full name..."}
                  className="flex-1 bg-[#0e1621] border border-zinc-800 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-red-500/50 placeholder:text-zinc-600 font-sans"
                />
                <button 
                  type="submit" 
                  className="p-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)] active:scale-95 flex items-center justify-center shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
              
              <a
                href="https://t.me/bloodundobot"
                target="_blank"
                rel="noreferrer"
                className="w-full py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 bg-gradient-to-r hover:border-zinc-700"
              >
                <span>Or Connect Real Telegram Bot</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-center py-2 px-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-emerald-400 gap-1.5 text-center">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span className="text-[10px] font-semibold">Account Linked & Receiving Alerts</span>
            </div>
          )}
          <div className="text-[8px] text-zinc-600 text-center font-mono">
            Interactive Chatbot Simulator
          </div>
        </div>
      </div>
    </div>
  );
}
