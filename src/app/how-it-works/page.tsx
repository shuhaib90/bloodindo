"use client";

import Link from "next/link";
import { Zap, Heart, Shield, MessageSquare, Trash2, Bell, Sparkles, ArrowLeft, Info, HelpCircle } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="relative min-h-screen bg-brand-black text-gray-100 overflow-hidden flex flex-col items-center px-4 py-16 sm:py-24">
      {/* Background Neon Blurs */}
      <div className="absolute -left-1/4 -top-1/4 h-[80vw] w-[80vw] rounded-full bg-brand-red-neon/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute -right-1/4 -bottom-1/4 h-[80vw] w-[80vw] rounded-full bg-brand-red-neon/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-4xl z-10">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-brand-red-neon transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-xl bg-brand-red-dark/20 border border-brand-red-neon/30 flex items-center justify-center text-brand-red-neon shadow-[0_0_15px_rgba(255,0,60,0.1)]">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-sans">
              How It Works
            </h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
              Kerala's High-Speed Emergency Blood Matching Network
            </p>
          </div>
        </div>

        {/* Introduction Banner */}
        <div className="glass-panel bg-brand-red-dark/10 border border-brand-red-neon/20 rounded-2xl p-5 mb-8 flex gap-4 items-start backdrop-blur-md">
          <Sparkles className="h-6 w-6 text-brand-red-neon shrink-0 animate-pulse mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Saving Lives at the Speed of Light</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Bloodundo connects hospitals and patients directly with matching O-Negative and critical donors in their vicinity. By combining geographic precision, instant Telegram alert dispatches, and voluntary blood screening compliance, we strip away coordination delays when every second counts.
            </p>
          </div>
        </div>

        {/* Core Sections Grid */}
        <div className="space-y-6">

          {/* 1. EMERGENCY MATCHING & RADAR */}
          <div className="glass-panel bg-brand-charcoal/30 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-brand-red-dark/20 border border-brand-red-neon/30 flex items-center justify-center text-brand-red-neon shadow-inner">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-sans">
                1. Geolocation Matching & Radar
              </h3>
            </div>
            
            <p className="text-sm text-gray-300 leading-relaxed font-medium">
              When a user submits an emergency request, our algorithm ranks active volunteer donors based on **blood group compatibility** and **geographic proximity**.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-brand-black border border-white/5 space-y-1.5">
                <span className="text-[10px] font-black text-brand-red-neon uppercase tracking-widest block">City-Level</span>
                <span className="text-xs font-bold text-white block">Immediate Responders</span>
                <p className="text-[10px] text-gray-500 font-medium">The matching engine instantly flags donors located in the exact city or area where the patient is admitted.</p>
              </div>
              <div className="p-4 rounded-xl bg-brand-black border border-white/5 space-y-1.5">
                <span className="text-[10px] font-black text-brand-red-glow uppercase tracking-widest block">District-Level</span>
                <span className="text-xs font-bold text-white block">Regional Alerts</span>
                <p className="text-[10px] text-gray-500 font-medium">If more units are needed, alerts are routed to verified donors in the surrounding districts within minutes.</p>
              </div>
              <div className="p-4 rounded-xl bg-brand-black border border-white/5 space-y-1.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Radar Scanner</span>
                <span className="text-xs font-bold text-white block">Jittered Vicinity Map</span>
                <p className="text-[10px] text-gray-500 font-medium">The Nearby Donors Radar maps compatible donors within an approximate radius, adding a safe random offset (jitter) to protect exact home address privacy.</p>
              </div>
            </div>
          </div>

          {/* 2. THE TELEGRAM ALERTS BOT */}
          <div className="glass-panel bg-brand-charcoal/30 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-brand-red-dark/20 border border-brand-red-neon/30 flex items-center justify-center text-brand-red-neon shadow-inner">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-sans">
                2. Secure Telegram Alert Engine
              </h3>
            </div>
            
            <p className="text-sm text-gray-300 leading-relaxed font-medium">
              Rather than spamming public channels, Bloodundo routes detailed emergency dispatches straight to your private Telegram chat using a secure authentication bot:
            </p>
            <div className="space-y-3 bg-brand-black border border-white/5 p-4 rounded-xl text-xs leading-relaxed text-gray-400">
              <p>
                1️⃣ Go to your secure **User Dashboard** and click **"Generate Code"** under the Connect Telegram card.
              </p>
              <p>
                2️⃣ A unique, expiring 10-minute code is generated for you (e.g. <code>BLOOD-847291</code>).
              </p>
              <p>
                3️⃣ Message the code to our official bot (<code>@bloodundo_bot</code>). The webhook validates the token, cleans it from the pending buffer, and links your account chat ID instantly.
              </p>
              <p className="text-brand-red-glow font-bold">
                ⚠️ PRIVACY SHIELD: Your private phone number is completely masked and never exposed to the Telegram API or public databases, shielding you from marketing harvesting or spam!
              </p>
            </div>
          </div>

          {/* 3. PROGRESSIVE WEB APP & NOTIFICATIONS */}
          <div className="glass-panel bg-brand-charcoal/30 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-brand-red-dark/20 border border-brand-red-neon/30 flex items-center justify-center text-brand-red-neon shadow-inner">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-sans">
                3. PWA Installation & Browser Alerts
              </h3>
            </div>
            
            <p className="text-sm text-gray-300 leading-relaxed font-medium">
              Bloodundo functions as a fully compliant **Progressive Web App (PWA)** on all modern iOS, Android, and Desktop platforms:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs text-gray-400 pl-1">
              <li><strong>Zero-Install PWA App:</strong> Click **"Install Now"** on the floating banner to add the app directly to your home screen with offline network support and ultra-fast page load times.</li>
              <li><strong>Browser Push Notifications:</strong> Activating push permissions registers your browser with our background Service Worker. You will receive native system alarms and donation-fulfillment notices directly on your device, even when the browser tab is closed.</li>
            </ul>
          </div>

          {/* 4. DONATION ELIGIBILITY TRACKER */}
          <div className="glass-panel bg-brand-charcoal/30 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-brand-red-dark/20 border border-brand-red-neon/30 flex items-center justify-center text-brand-red-neon shadow-inner">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-sans">
                4. Donation Eligibility Tracker
              </h3>
            </div>
            
            <p className="text-sm text-gray-300 leading-relaxed font-medium">
              To support medical best practices, the platform incorporates an automated **Eligibility Tracker** inside your dashboard:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs text-gray-400 pl-1">
              <li><strong>Donation Log:</strong> Tap **"I Donated Today"** to log a successful life-saving act. Your donor record automatically registers 100 bonus streak points and increments your donation badge count.</li>
              <li><strong>Rest-Window Countdown:</strong> The engine locks your radar availability status to *Inactive* for a **90-day rest window** (the safe medically advised timeline for red blood cell recovery). A countdown timer displays exactly when your body is safe to donate again, automatically reactivating your radar when the period expires.</li>
            </ul>
          </div>

          {/* 5. PRIVACY SHIELD & DELETION */}
          <div className="glass-panel bg-brand-charcoal/30 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-brand-red-dark/20 border border-brand-red-neon/30 flex items-center justify-center text-brand-red-neon shadow-inner">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-sans">
                5. Privacy Controls & Account Deletion
              </h3>
            </div>
            
            <p className="text-sm text-gray-300 leading-relaxed font-medium">
              We respect your right to privacy and absolute data ownership:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs text-gray-400 pl-1">
              <li><strong>Public Feed Redaction:</strong> Patient names and hospital telephone details are completely blanked out on public emergency cards. Only registered, compatible lifesavers who actively select to respond are granted access to critical patient and hospital contact data.</li>
              <li><strong>Radar Toggle:</strong> You can instantly turn off your geographic visibility on local radars by toggling your status to "Offline / Inactive" on the settings panel.</li>
              <li><strong>Danger Zone Account Deletion:</strong> If you wish to leave the network, open the Danger Zone in your account dashboard. Confirming with the word <code>DELETE</code> executes a permanent database purge, erasing all streaks, profile values, and Telegram webhook registrations.</li>
            </ul>
          </div>

          {/* 6. STRICT TERMS & ANTI-SPAM */}
          <div className="glass-panel bg-brand-charcoal/30 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-brand-red-dark/20 border border-brand-red-neon/30 flex items-center justify-center text-brand-red-neon shadow-inner">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-sans">
                6. Terms of Service & Anti-Spam
              </h3>
            </div>
            
            <p className="text-sm text-gray-300 leading-relaxed font-medium">
              To safeguard our volunteer community, the network operates under strict legal policies:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs text-gray-400 pl-1">
              <li><strong>100% Voluntary (No Commercialization):</strong> Demanding cash, convenience fees, or gifts for donating blood is strictly illegal under national healthcare laws. Accounts engaging in financial negotiations are permanently banned and reported to medical boards and authorities.</li>
              <li><strong>Anti-Spam & IP Tracking:</strong> Triggering fake emergency requests creates immediate system warnings. We record secure unique browser and device footprints to identify spam patterns, blacklisting repeat offenders instantly.</li>
            </ul>
          </div>

        </div>

        {/* Footer info */}
        <div className="mt-8 border-t border-white/5 pt-8 text-center text-xs text-gray-500 font-medium">
          &copy; 2026 Bloodundo. Handcrafted in Kerala. Dedicated to saving lives.
        </div>
      </div>
    </div>
  );
}
