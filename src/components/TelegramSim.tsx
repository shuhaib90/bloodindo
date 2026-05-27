"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, Smartphone, UserCheck, MessageSquare, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { db } from '../lib/db';

interface Message {
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  isContact?: boolean;
}

export default function TelegramSim() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: '🤖 <b>Welcome to Blood Indo Alerts Bot!</b>\n\nPlease share your phone number to connect your Blood Indo account for live emergency dispatches.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLinked, setIsLinked] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchProfile = () => {
    const profile = db.getUserProfile();
    setUserProfile(profile);
    if (profile.telegramChatId) {
      setIsLinked(true);
    } else {
      setIsLinked(false);
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
      
      if (profile.telegramChatId && db.isCompatible(profile.bloodGroup as any, req.bloodGroup)) {
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

  const handleShareContact = async () => {
    if (!userProfile || !userProfile.phone) {
      alert("Please save a phone number in your Profile tab first!");
      return;
    }

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user shared contact message
    setMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: `📞 Shared Phone: <b>${userProfile.phone}</b>`,
        timestamp: timeString,
        isContact: true
      }
    ]);

    // Send payload to our actual route.ts webhook endpoint!
    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          update_id: Math.floor(Math.random() * 100000),
          message: {
            message_id: Math.floor(Math.random() * 1000),
            from: { id: 999999, first_name: userProfile.name || 'User' },
            chat: { id: 999999, type: 'private' },
            date: Math.floor(Date.now() / 1000),
            contact: {
              phone_number: userProfile.phone,
              first_name: userProfile.name || 'User',
              user_id: 999999
            }
          }
        })
      });

      if (response.ok) {
        setIsLinked(true);
        // Refresh local view
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: `✅ <b>Account Connected!</b>\n\nWelcome, <b>${userProfile.name}</b>. Your Blood Indo website account is linked with Telegram.\n\nYou will automatically receive real-time notifications whenever a patient matches your blood group!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        
        // Update local profile representation
        fetchProfile();
      }
    } catch (e) {
      console.error("Simulation error", e);
    }
  };

  const handleResetSim = () => {
    if (userProfile) {
      const updated = { ...userProfile, telegramChatId: '' };
      db.saveUserProfile(updated);
      setIsLinked(false);
      setMessages([
        {
          sender: 'bot',
          text: '🤖 <b>Welcome to Blood Indo Alerts Bot!</b>\n\nPlease share your phone number to connect your Blood Indo account for live emergency dispatches.',
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
                className="whitespace-pre-line"
              />
              <span className="text-[9px] text-zinc-400/80 self-end mt-1.5">{msg.timestamp}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Bottom Actions Area */}
        <div className="bg-[#182533] p-3 border-t border-zinc-900 flex flex-col gap-2">
          {!isLinked ? (
            <button
              onClick={handleShareContact}
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold rounded-lg text-xs shadow-md shadow-red-950/30 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
            >
              Share Contact 📞
            </button>
          ) : (
            <div className="flex items-center justify-center py-2 px-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-emerald-400 gap-1.5 text-center">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span className="text-[10px] font-semibold">Account Linked & Receiving Alerts</span>
            </div>
          )}
          <div className="text-[9px] text-zinc-500 text-center">
            Virtual Telegram Bot Client
          </div>
        </div>
      </div>
    </div>
  );
}
