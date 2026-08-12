'use client';

import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

const applyTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem('gippo_theme') as Theme;
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      return saved;
    }
  } catch (e) {}
  return 'system';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  setTheme: (theme: Theme) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('gippo_theme', theme);
      } catch (e) {}
      applyTheme(theme);
    }
    set({ theme });
  },
  initTheme: () => {
    if (typeof window === 'undefined') return;
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);
    set({ theme: initialTheme });

    // Listen for OS prefers-color-scheme changes when in 'system' mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (get().theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  },
}));
