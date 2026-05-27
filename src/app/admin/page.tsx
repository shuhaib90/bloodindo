"use client";

import { useState, useEffect } from 'react';
import { Terminal, ShieldAlert, Flame, Phone, MessageSquare, Trash2, Plus, Activity, CheckCircle2 } from "lucide-react";
import { db, SystemAlert } from "../../lib/db";

export default function AdminPage() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [systemStats, setSystemStats] = useState({
    twilioCalls: 24,
    telegramMsgs: 48,
    activeBroadcasts: 3,
    volunteerMatches: 95
  });

  const loadData = () => {
    setAlerts(db.getSystemAlerts());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleManualTwilio = () => {
    db.addSystemAlert({
      type: 'voice_call',
      message: 'MANUAL OVERRIDE: Dispatched Twilio outbound voice synthesis call to all nearby O-negative lifesavers.'
    });
    setSystemStats(prev => ({ ...prev, twilioCalls: prev.twilioCalls + 1 }));
    loadData();
    alert("Twilio voice call dispatched in simulation!");
  };

  const handleManualTelegram = () => {
    db.addSystemAlert({
      type: 'telegram',
      message: 'MANUAL OVERRIDE: Telegram Bot broadcasted emergency News Alert flashes to all subscribed regional channels.'
    });
    setSystemStats(prev => ({ ...prev, telegramMsgs: prev.telegramMsgs + 1 }));
    loadData();
    alert("Telegram bot broadcast sent in simulation!");
  };

  const handleClearCache = () => {
    if (confirm("Are you sure you want to reset all blood requests, alerts, and system cache to default?")) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        loadData();
        alert("Cache cleared successfully! App reset to defaults.");
        window.location.href = '/';
      }
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "request": return 'text-brand-red-neon';
      case "telegram": return 'text-sky-400';
      case "voice_call": return 'text-emerald-400';
      default: return 'text-brand-red-glow';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col gap-6 relative">
      <div className="absolute -right-32 top-32 h-96 w-96 rounded-full bg-brand-red-neon/5 blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider font-sans flex items-center gap-2">
            <Terminal className="h-6 w-6 text-brand-red-neon" /> Command Center Monitor
          </h1>
          <p className="text-xs text-gray-400 mt-1.5">Stream real-time automated bot alerts, Twilio calls, and system injection overrides.</p>
        </div>

        <div className="flex items-center gap-2.5 glass-panel bg-brand-charcoal/40 px-4 py-2.5 rounded-xl border border-white/5">
          <span className="h-2 w-2 rounded-full bg-brand-red-neon animate-ping"></span>
          <span className="text-xs font-bold text-brand-red-glow uppercase tracking-wider">INTELLIGENCE SYSTEM ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Terminal Logs */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-panel bg-brand-charcoal/90 border border-brand-red-neon/30 rounded-2xl p-6 font-mono shadow-2xl shadow-brand-red-neon/15">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-red-neon">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-red-neon animate-pulse"></span>
                SYSTEM_CONSOLE:/listening
              </div>
              <span className="text-[10px] text-gray-500">SECURE_HTTPS_GATEWAY</span>
            </div>

            <div className="bg-brand-black/80 rounded-xl border border-white/5 p-4 h-96 overflow-y-auto space-y-3 text-xs">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-gray-600">[{new Date(alert.timestamp).toLocaleTimeString()}]</span>
                  <span className={getAlertColor(alert.type)}>system_alert_log:</span>
                  <span className="text-gray-300">{alert.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions & Stats */}
        <div className="w-full z-10 space-y-6">
          <div className="glass-panel bg-brand-charcoal/40 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
              <Activity className="h-5 w-5 text-brand-red-neon" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Dashboard</h3>
            </div>

            <div className="space-y-4 bg-brand-black/40 border border-white/5 rounded-xl p-4 text-xs text-gray-400">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Twilio Voice Dispatches</span>
                <span className="text-white font-bold">{systemStats.twilioCalls} calls</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Telegram Bot flashes</span>
                <span className="text-white font-bold">{systemStats.telegramMsgs} alerts</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Active Broadcasts</span>
                <span className="text-brand-red-neon font-bold">{systemStats.activeBroadcasts} active</span>
              </div>
              <div className="flex justify-between">
                <span>Volunteer Matches</span>
                <span className="text-emerald-400 font-bold">{systemStats.volunteerMatches} matches</span>
              </div>
            </div>
          </div>

          <div className="glass-panel bg-brand-charcoal/40 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
              <ShieldAlert className="h-5 w-5 text-brand-red-neon" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Override Controls</h3>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleManualTwilio}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 text-xs font-bold active:scale-95 transition-all"
              >
                <Phone className="h-4 w-4 fill-white" /> Dispatch Twilio Voice
              </button>

              <button
                onClick={handleManualTelegram}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 text-xs font-bold active:scale-95 transition-all"
              >
                <MessageSquare className="h-4 w-4" /> Broadcast Telegram Bot
              </button>

              <div className="border-t border-white/5 pt-4 mt-4">
                <button
                  onClick={handleClearCache}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-brand-red-dark/20 border border-brand-red-neon/30 hover:bg-brand-red-dark/40 text-brand-red-glow py-3 text-xs font-bold active:scale-95 transition-all"
                >
                  <Trash2 className="h-4 w-4" /> Reset Emergency Cache
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
