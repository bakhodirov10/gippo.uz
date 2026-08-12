'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useThemeStore, Theme } from '@/stores/useThemeStore';
import { Language } from '@/locales/dictionary';
import { Globe, Sun, Moon, Monitor, ChevronDown } from 'lucide-react';

export function ThemeLanguageSwitcher() {
  const { lang, setLanguage, t } = useLanguageStore();
  const { theme, setTheme } = useThemeStore();

  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setLangOpen(false);
        setThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const langLabels: Record<Language, { label: string; short: string }> = {
    uz: { label: "O'zbek", short: 'UZ' },
    ru: { label: 'Русский', short: 'RU' },
    en: { label: 'English', short: 'EN' },
  };

  const themeItems: { id: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'light', label: t.theme.light, icon: Sun },
    { id: 'dark', label: t.theme.dark, icon: Moon },
    { id: 'system', label: t.theme.system, icon: Monitor },
  ];

  return (
    <div ref={containerRef} className="flex items-center gap-2 select-none">
      {/* Language Selector */}
      <div className="relative">
        <button
          onClick={() => {
            setLangOpen(!langOpen);
            setThemeOpen(false);
          }}
          aria-label="Switch Language"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-teal-400 dark:hover:border-teal-500 transition-colors shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>{langLabels[lang].label}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {langOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-50 animate-fade-up">
            {(['uz', 'ru', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLanguage(l);
                  setLangOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${
                  lang === l
                    ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/50'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{langLabels[l].label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {langLabels[l].short}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme Selector */}
      <div className="relative">
        <button
          onClick={() => {
            setThemeOpen(!themeOpen);
            setLangOpen(false);
          }}
          aria-label="Switch Theme"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-teal-400 dark:hover:border-teal-500 transition-colors shadow-sm"
        >
          {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
          {theme === 'dark' && <Moon className="w-4 h-4 text-sky-400" />}
          {theme === 'system' && <Monitor className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
        </button>

        {themeOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-50 animate-fade-up">
            {themeItems.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTheme(item.id);
                    setThemeOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${
                    theme === item.id
                      ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/50'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComp className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  {theme === item.id && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
