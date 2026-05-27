"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '../locales/en.json';
import ml from '../locales/ml.json';
import mg from '../locales/mg.json';
import { db } from '../lib/db';

type Language = 'en' | 'ml' | 'mg';
type Translations = Record<string, string>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const dictionaries: Record<Language, Translations> = {
  en,
  ml,
  mg
};

// Default fallback that uses Malayalam
const defaultContext: LanguageContextType = {
  language: 'ml',
  setLanguage: () => {},
  t: (key: string) => (ml as Translations)[key] || key
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ml');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check local storage first
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang && dictionaries[savedLang]) {
      setLanguageState(savedLang);
    } else {
      // Default to Malayalam if no saved preference
      setLanguageState('ml');
      localStorage.setItem('app_language', 'ml');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_language', lang);
    }
  };

  const t = (key: string): string => {
    const dict = dictionaries[language];
    return dict[key] || (en as Translations)[key] || key;
  };

  if (!mounted) {
    // Prevent hydration mismatch - use English fallback during SSR
    return (
      <LanguageContext.Provider value={defaultContext}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
