"use client";

import { useState, useEffect } from 'react';
import { ShieldAlert, Globe, Check } from 'lucide-react';
import { useTranslation } from './LanguageContext';

export default function WarningModal() {
  const { t, language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if warning has been dismissed in this or previous session
    const warningSeen = localStorage.getItem('bloodindo_warning_dismissed');
    if (!warningSeen) {
      setIsOpen(true);
    }

    const handleShowModal = () => {
      setIsOpen(true);
    };

    window.addEventListener('show-warning-modal', handleShowModal);
    return () => {
      window.removeEventListener('show-warning-modal', handleShowModal);
    };
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('bloodindo_warning_dismissed', 'true');
    setIsOpen(false);
  };

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
        onClick={() => {}} // Do not dismiss on click outside
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-gradient-to-b from-red-950/30 to-zinc-950 border border-red-500/30 rounded-2xl p-6 md:p-8 shadow-2xl shadow-red-900/20 overflow-hidden transform scale-100 transition-all duration-300">
        
        {/* Neon top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-600 to-red-500 shadow-[0_0_10px_#ef4444]" />
        
        {/* Animated grid overlay to match premium aesthetic */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

        {/* Language selector in modal */}
        <div className="relative z-10 flex justify-end mb-6">
          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg p-1">
            <Globe className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'en'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ml')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'ml'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              മലയാളം
            </button>
            <button
              onClick={() => setLanguage('mg')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'mg'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Manglish
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>

          <h2 className="text-xl md:text-2xl font-bold font-outfit text-white mb-6 tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            {t('warning_title')}
          </h2>

          <div className="space-y-4 text-zinc-300 text-sm md:text-base text-left max-h-[300px] overflow-y-auto pr-2 custom-scrollbar font-inter">
            <div className="p-3 bg-red-950/20 border-l-2 border-red-500 rounded-r-md text-red-400/90 font-medium">
              {t('warning_p1')}
            </div>
            
            <p className="leading-relaxed">
              {t('warning_p2')}
            </p>

            <p className="leading-relaxed text-zinc-400 italic">
              {t('warning_p3')}
            </p>

            <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-2">
              <p className="leading-relaxed flex items-start gap-2 text-emerald-400/90">
                <span className="inline-block mt-1 min-w-[6px] min-h-[6px] rounded-full bg-emerald-400" />
                <span>{t('warning_p4').split('. ')[0]}.</span>
              </p>
              <p className="leading-relaxed flex items-start gap-2 text-amber-500/90">
                <span className="inline-block mt-1 min-w-[6px] min-h-[6px] rounded-full bg-amber-500" />
                <span>{t('warning_p4').split('. ').slice(1).join('. ')}</span>
              </p>
            </div>

            <p className="leading-relaxed font-semibold text-center text-white pt-2">
              {t('warning_p5')}
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="mt-8 w-full py-3.5 px-6 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-[0.98]"
          >
            <Check className="w-5 h-5" />
            <span>{t('warning_btn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
