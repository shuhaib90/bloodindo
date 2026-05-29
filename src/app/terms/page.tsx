"use client";

import Link from "next/link";
import { Shield, ArrowLeft, FileText, CheckCircle } from "lucide-react";

export default function TermsAndConditions() {
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
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-sans">
              Terms & Conditions
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
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red-neon"></span>
              1. Acceptance of Terms
            </h2>
            <p className="text-sm sm:text-base">
              By accessing, browsing, or using the <strong>Blood Indo (bloodundo.in)</strong> platform, you agree to be bound by these Terms and Conditions and all applicable laws. If you do not agree with any of these terms, you are prohibited from using or accessing this platform. The platform is dedicated strictly to facilitating volunteer-based emergency blood donation matching.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red-neon"></span>
              2. Strict Voluntary Policy (Anti-Commercialization)
            </h2>
            <div className="p-4 bg-brand-red-dark/10 border border-brand-red-neon/20 rounded-xl space-y-2">
              <p className="text-sm font-semibold text-brand-red-glow flex items-center gap-2">
                <Shield className="h-4 w-4 shrink-0" />
                CRITICAL DIRECTIVE
              </p>
              <p className="text-xs sm:text-sm text-gray-300">
                Blood donation facilitated through this platform is <strong>100% voluntary</strong>. Selling blood, demanding financial compensation, or requesting gifts or convenience fees is <strong>strictly prohibited</strong> and is illegal under local healthcare laws. Any account found demanding, offering, or negotiating money for blood donation will be permanently banned and reported to relevant law enforcement agencies immediately.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red-neon"></span>
              3. Emergency Dispatches & Integrity
            </h2>
            <p className="text-sm sm:text-base">
              Triggering emergency broadcasts dispatches automated SMS logs, Telegram alerts, and updates to nearest donors. Users must act with absolute honesty:
            </p>
            <ul className="list-none space-y-2 pl-2">
              <li className="flex items-start gap-2.5 text-sm sm:text-base">
                <CheckCircle className="h-4 w-4 text-brand-red-neon shrink-0 mt-1" />
                <span><strong>False Dispatches:</strong> Creating dummy requests or staging simulated emergencies is strictly monitored and will result in permanent device IP bans.</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm sm:text-base">
                <CheckCircle className="h-4 w-4 text-brand-red-neon shrink-0 mt-1" />
                <span><strong>Accuracy of Info:</strong> Organizers, individuals, NGOs, and hospitals are responsible for confirming the accuracy of patient name, blood group type, location, and hospital location before triggering broadcasts.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red-neon"></span>
              4. Camp & Event Posting Guidelines
            </h2>
            <p className="text-sm sm:text-base">
              Hospitals, NGOs, and blood banks posting awareness events and blood donation camps agree that:
            </p>
            <ul className="list-none space-y-2 pl-2">
              <li className="flex items-start gap-2.5 text-sm sm:text-base">
                <CheckCircle className="h-4 w-4 text-brand-red-neon shrink-0 mt-1" />
                <span>All listed events must correspond to actual, verified blood drives.</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm sm:text-base">
                <CheckCircle className="h-4 w-4 text-brand-red-neon shrink-0 mt-1" />
                <span>Organizers must obtain necessary permissions from government authorities and medical councils before conducting camps.</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm sm:text-base">
                <CheckCircle className="h-4 w-4 text-brand-red-neon shrink-0 mt-1" />
                <span>Uploaded media banners and organizer logos must not violate intellectual property rights.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red-neon"></span>
              5. Disclaimer of Liability
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              Blood Indo acts solely as a matching and dispatch gateway. We do not inspect, test, or verify the medical status, infectious diseases, or physical fitness of volunteer donors, nor do we certify the medical capacity of hospitals. Users, donors, and recipients must follow standard medical screening guidelines and hospital regulations during direct donation. We are not responsible for any adverse event during or after donation.
            </p>
          </section>

          <div className="border-t border-white/5 pt-6 text-center text-xs text-gray-500 font-medium">
            &copy; 2026 Blood Indo. Handcrafted in Kerala. Dedicated to saving lives.
          </div>
        </div>
      </div>
    </div>
  );
}
