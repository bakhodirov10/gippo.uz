'use client';

import { create } from 'zustand';
import { Language, translations } from '@/locales/dictionary';

interface LanguageState {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['uz'];
  initLanguage: () => void;
}

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'uz';
  try {
    const saved = localStorage.getItem('gippo_lang') as Language;
    if (saved && (saved === 'uz' || saved === 'ru' || saved === 'en')) {
      return saved;
    }
    const browserLang = (navigator.language || '').toLowerCase();
    if (browserLang.startsWith('ru')) return 'ru';
    if (browserLang.startsWith('en')) return 'en';
  } catch (e) {}
  return 'uz';
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  lang: 'uz',
  t: translations['uz'],
  setLanguage: (lang: Language) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('gippo_lang', lang);
        document.documentElement.lang = lang;
      } catch (e) {}
    }
    set({ lang, t: translations[lang] });
  },
  initLanguage: () => {
    if (typeof window === 'undefined') return;
    const initialLang = getInitialLanguage();
    document.documentElement.lang = initialLang;
    set({ lang: initialLang, t: translations[initialLang] });
  },
}));
