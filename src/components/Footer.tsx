"use client";

import Link from "next/link";
import { Heart, Instagram, Linkedin, Send, ShieldAlert, Award, Globe } from "lucide-react";
import { useTranslation } from "./LanguageContext";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-brand-black border-t border-white/5 relative overflow-hidden z-10">
      {/* Subtle glow accent */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 h-[150px] w-[300px] rounded-full bg-brand-red-neon/5 blur-[80px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-12">
          
          {/* Brand Profile */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-brand-red border border-brand-red-neon flex items-center justify-center font-black text-white text-sm shadow-[0_0_10px_rgba(255,0,60,0.3)]">
                BU
              </div>
              <span className="text-lg font-black tracking-wider uppercase text-white font-sans">
                bloodundo.in
              </span>
            </div>
            
            <p className="text-sm text-gray-400 max-w-sm font-medium leading-relaxed">
              Real-time emergency blood donation matching and community life-saving alerts. Powered by the people, for the people.
            </p>

                        {/* Kerala Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-red-dark/15 border border-brand-red-neon/20 text-xs font-bold text-brand-red-glow">
                <Globe className="h-3.5 w-3.5 animate-spin-slow text-brand-red-neon" />
                <span className="flex items-center gap-1">
                  Built with <Heart className="h-3.5 w-3.5 fill-brand-red-neon text-brand-red-neon animate-pulse shrink-0" /> in Kerala
                </span>
              </div>
            </div>
          </div>

          {/* Core Platform Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <Link href="/feed" className="text-gray-400 hover:text-brand-red-neon transition-colors">
                  Emergency Feed
                </Link>
              </li>
              <li>
                <Link href="/donors" className="text-gray-400 hover:text-brand-red-neon transition-colors">
                  Find Donors
                </Link>
              </li>
              <li>
                <Link href="/camps" className="text-gray-400 hover:text-brand-red-neon transition-colors">
                  Camps & Events
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-brand-red-neon transition-colors">
                  User Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials & Builder Connect */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Connect with Developer
            </h4>
            <p className="text-xs text-gray-400 leading-normal">
              Get in touch with the creator of bloodundo.in for updates, suggestions, or collaborations.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.instagram.com/shuhaiiib_._"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-brand-charcoal/50 border border-white/5 flex items-center justify-center text-gray-400 hover:text-brand-red-neon hover:border-brand-red-neon/30 hover:scale-105 transition-all duration-300 shadow-md group"
                title="Instagram Profile"
              >
                <Instagram className="h-4.5 w-4.5 group-hover:rotate-6 transition-transform" />
              </a>
              <a
                href="https://www.linkedin.com/in/shuhaibs9064736"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-brand-charcoal/50 border border-white/5 flex items-center justify-center text-gray-400 hover:text-brand-red-neon hover:border-brand-red-neon/30 hover:scale-105 transition-all duration-300 shadow-md group"
                title="LinkedIn Profile"
              >
                <Linkedin className="h-4.5 w-4.5 group-hover:rotate-6 transition-transform" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright and Legal */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">
            &copy; {new Date().getFullYear()} bloodundo.in. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Link href="/terms" className="hover:text-brand-red-neon transition-colors">
              Terms &amp; Conditions
            </Link>
            <span className="h-3 w-px bg-white/10"></span>
            <Link href="/privacy" className="hover:text-brand-red-neon transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
