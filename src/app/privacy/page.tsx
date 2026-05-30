"use client";

import Link from "next/link";
import { Eye, ArrowLeft, ShieldCheck, MapPin, Bell } from "lucide-react";

export default function PrivacyPolicy() {
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
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-sans">
              Privacy Policy
            </h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
              Last Updated: May 2026
            </p>
          </div>
        </div>

        {/* Premium Content Card */}
        <div className="glass-panel bg-brand-charcoal/30 border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 leading-relaxed text-gray-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              1. Information We Collect
            </h2>
            <p className="text-sm sm:text-base">
              To operate our real-time matching engine and trigger instant dispatches, we collect and store minimum essential user data:
            </p>
            <ul className="list-disc list-inside pl-2 space-y-2 text-sm sm:text-base text-gray-300">
              <li><strong>Profile Information:</strong> Name, phone number, and blood group type.</li>
              <li><strong>Location Data:</strong> State, district, city, and area. This is essential for ranking nearby donors during emergencies.</li>
              <li><strong>Telegram Connection:</strong> Chat IDs linked securely via short-lived verification codes (e.g. <code>BLOOD-XXXXXX</code>) to protect user identity and dispatch private alerts.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              2. Privacy Shield (Emergency Data Redaction)
            </h2>
            <div className="p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-xl space-y-2">
              <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                PRIVACY SHIELD DEPLOYED
              </p>
              <p className="text-xs sm:text-sm text-gray-300">
                To protect patient privacy, we **redact specific patient and contact details** from public landing feeds. Only verified registered donors or organizers linked to the request get secure access to patient and contact information. Public visitors only view the general blood group and broad regional indicators.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              3. Location Matching & Dynamic Alert Rules
            </h2>
            <p className="text-sm sm:text-base">
              Our automated match priority rules process geographical parameters case-insensitively using standard lowercase evaluation. Alerts are dispatched to Telegram bot linked lifesavers in order of priority:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <div className="p-4 rounded-xl bg-brand-charcoal/50 border border-white/5 flex flex-col">
                <span className="text-xs font-bold text-brand-red-neon uppercase">Level 1 (Immediate)</span>
                <span className="text-sm font-bold text-white mt-1">Same City Match</span>
                <p className="text-xs text-gray-500 mt-2">Alert dispatched instantly to donors registered in the exact city where the crisis occurred.</p>
              </div>
              <div className="p-4 rounded-xl bg-brand-charcoal/50 border border-white/5 flex flex-col">
                <span className="text-xs font-bold text-brand-red-glow uppercase">Level 2 (Radius)</span>
                <span className="text-sm font-bold text-white mt-1">Same District Match</span>
                <p className="text-xs text-gray-500 mt-2">Alert dispatched within minutes to surrounding locations inside the exact district boundary.</p>
              </div>
              <div className="p-4 rounded-xl bg-brand-charcoal/50 border border-white/5 flex flex-col">
                <span className="text-xs font-bold text-gray-400 uppercase">Level 3 (Regional)</span>
                <span className="text-sm font-bold text-white mt-1">Same State Match</span>
                <p className="text-xs text-gray-500 mt-2">Alert queued for regional lifesavers in rare blood type emergencies.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              4. Telegram Security and Integration
            </h2>
            <p className="text-sm sm:text-base">
              Unlike typical bots that scrape public numbers, our platform matches Telegram chat IDs through an **expiring 10-minute secure token code** generated in your secure account dashboard. This shields your registered phone number from public harvesting, preventing spam while ensuring swift alerts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              5. Data Control & Deletion Requests
            </h2>
            <p className="text-sm sm:text-base">
              You own your profile. You can toggle your donation status to 'Inactive' on your dashboard to pause proximity radars and alerts. If you wish to delete your account, you can disconnect your Telegram links instantly, or reach out to our administration to erase all stored values permanently from our databases.
            </p>
          </section>

          <div className="border-t border-white/5 pt-6 text-center text-xs text-gray-500 font-medium">
            &copy; 2026 Bloodundo. Handcrafted in Kerala. Dedicated to saving lives.
          </div>
        </div>
      </div>
    </div>
  );
}
