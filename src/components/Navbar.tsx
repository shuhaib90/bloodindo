"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Flame, Bell, Menu, X, ShieldAlert, Heart, User, Building2, Terminal, Calendar } from 'lucide-react';
import { db } from '../lib/db';
import { useTranslation } from './LanguageContext';

export default function Navbar() {
  const { t, language, setLanguage } = useTranslation();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [pulse, setPulse] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const updateLoginStatus = () => {
      const profile = db.getUserProfile();
      setIsLoggedIn(profile && profile.isLoggedIn);
    };

    updateLoginStatus();

    window.addEventListener('telegram-status-updated', updateLoginStatus);
    window.addEventListener('storage', updateLoginStatus);
    
    return () => {
      window.removeEventListener('telegram-status-updated', updateLoginStatus);
      window.removeEventListener('storage', updateLoginStatus);
    };
  }, []);

  useEffect(() => {
    db.initializeSupabaseSync();

    const updateCount = () => {
      const requests = db.getRequests();
      const active = requests.filter(r => r.status === 'Active').length;
      setActiveCount(active);
    };

    updateCount();
    
    const interval = setInterval(() => {
      updateCount();
      db.initializeSupabaseSync();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => !p);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

    const navItems = [
    { name: t("nav_emergency_feed"), href: '/feed', icon: ShieldAlert },
    { name: t("nav_donor_radar"), href: '/donors', icon: Heart },
    { name: "Camps & Events", href: '/camps', icon: Calendar },
    ...(isLoggedIn ? [{ name: t("nav_my_profile"), href: '/dashboard', icon: User }] : []),
    { name: t("nav_hospital_hub"), href: '/hospital', icon: Building2 },
  ];

  const linkClass = (isActive: boolean) =>
    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 " +
    (isActive
      ? 'bg-brand-red-neon/15 text-brand-red-glow border border-brand-red-neon/30 shadow-[0_0_15px_rgba(255,0,60,0.15)]'
      : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent');

  const mobileLinkClass = (isActive: boolean) =>
    "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all " +
    (isActive
      ? 'bg-brand-red-neon/10 text-brand-red-glow border-l-4 border-brand-red-neon'
      : 'text-gray-300 hover:bg-white/5 hover:text-white');

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 bg-brand-black/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img src="/logo.png" alt="bloodundo logo" className="h-9 w-9 object-contain shrink-0 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                BLOOD<span className="text-brand-red-neon font-black">INDO</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkClass(isActive)}
                >
                  <Icon className={"h-4 w-4 " + (isActive ? 'text-brand-red-neon' : '')} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Active Alerts Beacon & Controls */}
          <div className="hidden md:flex items-center gap-4">

            {/* Must Read Button */}
            <button
              onClick={() => window.dispatchEvent(new Event('show-warning-modal'))}
              className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-950/20 px-3.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)]"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-red-500 animate-pulse" />
              <span>{t("nav_warning_btn")}</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-brand-black/50 border border-white/10 rounded-lg text-xs font-bold text-gray-300 px-2 py-1.5 focus:outline-none focus:border-brand-red-neon cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ml">മലയാളം</option>
                <option value="mg">Manglish</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-brand-red-neon/20 bg-brand-red-dark/20 px-3 py-1.5 text-xs font-semibold text-brand-red-glow shadow-[0_0_10px_rgba(255,0,60,0.05)]">
              <span className={"relative flex h-2.5 w-2.5 " + (pulse ? 'scale-110' : 'scale-95') + " transition-transform duration-500"}>
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-red-neon opacity-75 animate-ping"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-red-neon"></span>
              </span>
              <span className="tracking-wide uppercase">{activeCount} Urgent Alerts Active</span>
            </div>
            
            {!isLoggedIn && (
              <Link 
                href="/dashboard?auth=true" 
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4.5 py-2 text-sm font-bold text-gray-200 hover:text-white transition-all active:scale-95"
              >
                <User className="h-4 w-4 text-brand-red-neon" />
                <span>Login</span>
              </Link>
            )}

            <Link 
              href="/feed?trigger=true" 
              className="relative overflow-hidden rounded-full bg-gradient-to-r from-brand-red to-brand-red-neon px-5 py-2 text-sm font-bold text-white shadow-lg shadow-brand-red-neon/20 transition-all hover:scale-105 hover:shadow-brand-red-neon/45 active:scale-95"
            >
              Request Blood
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            {activeCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-brand-red-neon/20 px-2.5 py-1 text-[10px] font-bold text-brand-red-glow">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-red-neon animate-pulse"></span>
                {activeCount}
              </div>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-brand-charcoal/95 backdrop-blur-lg transition-all animate-fadeIn">
          <div className="space-y-1 px-2 pb-4 pt-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={mobileLinkClass(isActive)}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Mobile Must Read Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                window.dispatchEvent(new Event('show-warning-modal'));
              }}
              className="flex w-[calc(100%-16px)] mx-2 items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-red-400 hover:bg-red-950/20 border border-red-500/20 transition-all"
            >
              <ShieldAlert className="h-5 w-5 text-red-500 animate-pulse" />
              {t("nav_warning_btn")}
            </button>

            {/* Mobile Language Switcher */}
            <div className="mt-4 px-4 py-3 flex items-center justify-between border-t border-b border-white/5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Language</span>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-brand-black border border-white/10 rounded-lg text-xs font-bold text-gray-300 px-3 py-1.5 focus:outline-none focus:border-brand-red-neon cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ml">മലയാളം</option>
                <option value="mg">Manglish</option>
              </select>
            </div>

            {!isLoggedIn && (
              <Link
                href="/dashboard?auth=true"
                onClick={() => setIsOpen(false)}
                className="flex w-[calc(100%-16px)] mx-2 mt-4 items-center justify-center gap-2 rounded-lg py-3 text-base font-bold text-gray-300 hover:bg-white/5 border border-white/10 transition-all"
              >
                <User className="h-5 w-5 text-brand-red-neon" />
                <span>Secure Login</span>
              </Link>
            )}

            <div className="mt-4 px-4">
              <Link
                href="/feed?trigger=true"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-red to-brand-red-neon py-3 text-center text-sm font-bold text-white shadow-lg shadow-brand-red-neon/20"
              >
                Request Urgent Blood
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
