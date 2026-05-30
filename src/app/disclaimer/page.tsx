"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Heart, FileWarning, Mail, MapPin } from "lucide-react";

export default function Disclaimer() {
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
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-sans">
              Legal Disclaimers & Policies
            </h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
              Safety, Medical Rules & Anti-Spam Compliance
            </p>
          </div>
        </div>

        {/* Premium Content Card */}
        <div className="glass-panel bg-brand-charcoal/30 border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 leading-relaxed text-gray-300">
          
          {/* 1. MEDICAL DISCLAIMER */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red-neon"></span>
              1. Medical Disclaimer
            </h2>
            <p className="text-sm sm:text-base">
              <strong>Bloodundo (bloodundo.in)</strong> is a communication platform designed solely to connect hospitals and patient representatives with voluntary blood donors. We are <strong>not a medical provider, blood bank, or healthcare facility</strong>.
            </p>
            <div className="p-4 bg-brand-red-dark/10 border border-brand-red-neon/20 rounded-xl space-y-2">
              <p className="text-xs sm:text-sm text-gray-300">
                • <strong>No Medical Screenings:</strong> We do not inspect, test, or verify the medical safety, blood compatibility, infectious disease status (such as HIV, Hepatitis, etc.), or physical fitness of any donor.
              </p>
              <p className="text-xs sm:text-sm text-gray-300">
                • <strong>Hospital Mandate:</strong> All medical screening, testing, physical verification, and standard blood donation procedures must be performed directly under the supervision of licensed medical practitioners at the respective hospital or blood bank.
              </p>
              <p className="text-xs sm:text-sm text-gray-300">
                • <strong>User Responsibility:</strong> Recipients and medical personnel are solely responsible for verifying donor suitability before completing any transfusion.
              </p>
            </div>
          </section>

          {/* 2. EMERGENCY DISCLAIMER */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red-neon"></span>
              2. Emergency Disclaimer
            </h2>
            <p className="text-sm sm:text-base">
              This platform is a voluntary, community-driven life-saving alert gateway. It acts as an auxiliary communication utility and **must not** be used as a replacement for professional emergency services.
            </p>
            <div className="p-4 bg-yellow-950/10 border border-yellow-500/20 rounded-xl space-y-2">
              <p className="text-xs sm:text-sm text-gray-300">
                • <strong>No Response Guarantees:</strong> While alerts are broadcast instantly via Telegram and PWA notifications to local matched donors, we do not guarantee that a compatible donor will be available, will respond to the alert, or will arrive at the hospital.
              </p>
              <p className="text-xs sm:text-sm text-gray-300">
                • <strong>Standard Services:</strong> In all medical crises, always call your local government medical emergency hotline (e.g. <strong>102 or 108</strong> in India) alongside posting a request here.
              </p>
              <p className="text-xs sm:text-sm text-gray-300">
                • <strong>Delayed/Failed Transfusions:</strong> Bloodundo and its development team bear no liability for any delays, medical issues, or failed donor arrivals resulting from the usage of this platform.
              </p>
            </div>
          </section>

          {/* 3. ANTI-SPAM POLICY */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red-neon"></span>
              3. Anti-Spam Policy
            </h2>
            <p className="text-sm sm:text-base">
              We operate a strict, zero-tolerance policy against any form of platform commercialization, spamming, fake request creation, or donor harassment:
            </p>
            <ul className="list-disc list-inside pl-2 space-y-2 text-sm sm:text-base text-gray-300">
              <li><strong>Zero Commercialization:</strong> Demanding or negotiating financial compensation, convenience fees, or gifts in exchange for blood is strictly illegal and violates our terms. Any user involved in transaction discussions will be permanently banned.</li>
              <li><strong>Fake Requests:</strong> Submitting fake patient names, falsified hospital details, or test requests is strictly monitored. We track unique device footprints and will blacklist any IP or phone number associated with abuse.</li>
              <li><strong>Donor Protection:</strong> Phone numbers and Telegram credentials connected to the platform are solely for immediate lifesaving coordination. Using these details for marketing, solicitation, or harassment will result in immediate legal reporting.</li>
            </ul>
          </section>

          {/* 4. CONTACT INFORMATION */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red-neon"></span>
              4. Contact & Support Information
            </h2>
            <p className="text-sm sm:text-base">
              If you have any questions, feedback, security reports, or require support, please contact the developer team immediately:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-brand-charcoal/50 border border-white/5 flex items-center gap-3">
                <Mail className="h-5 w-5 text-brand-red-neon shrink-0" />
                <div>
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Official Email</span>
                  <a href="mailto:support@bloodundo.in" className="text-sm text-white font-bold hover:underline">support@bloodundo.in</a>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-brand-charcoal/50 border border-white/5 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-brand-red-neon shrink-0" />
                <div>
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Kerala Community HQ</span>
                  <span className="text-sm text-white font-semibold">Kochi, Kerala, India</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-normal pt-2">
              You can also contact the founder directly for real-time compliance operations via Instagram at <a href="https://www.instagram.com/shuhaiiib_._" target="_blank" rel="noopener noreferrer" className="text-brand-red-glow font-bold hover:underline">@shuhaiiib_._</a> or LinkedIn.
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
