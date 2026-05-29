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

                        {/* Kerala Badge & APK Install */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-red-dark/15 border border-brand-red-neon/20 text-xs font-bold text-brand-red-glow">
                <Globe className="h-3.5 w-3.5 animate-spin-slow text-brand-red-neon" />
                <span>Built with â¤ï¸ in Kerala</span>
              </div>
              
              {/* Install APK Button */}
              <a
                href="/app-release.apk"
                download="BloodUndo.apk"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60 text-xs font-bold text-emerald-400 hover:text-white hover:bg-emerald-500/20 transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 group cursor-pointer"
                title="Download BloodUndo Android APK"
              >
                <svg className="h-3.5 w-3.5 fill-current group-hover:rotate-12 transition-transform text-emerald-400" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.5 13c-.8 0-1.5-.7-1.5-1.5S16.7 10 17.5 10s1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-11 0c-.8 0-1.5-.7-1.5-1.5S5.7 10 6.5 10s1.5.7 1.5 1.5-.7 1.5-1.5 1.5zM12 17.5c-2.3 0-4.3-1.4-5.2-3.4h10.4c-.9 2-2.9 3.4-5.2 3.4zm5.8-9.3l1.8-3.1c.1-.2 0-.5-.2-.6-.2-.1-.5 0-.6.2l-1.9 3.2C15.3 7.3 13.7 7 12 7s-3.3.3-4.9.9L5.2 4.7c-.1-.2-.4-.3-.6-.2-.2.1-.3.4-.2.6l1.8 3.1C3.8 10 2 12.5 2 15.5h20c0-3-1.8-5.5-4.2-7.3z"/>
                </svg>
                <span>Install Android APK</span>
              </a>
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
