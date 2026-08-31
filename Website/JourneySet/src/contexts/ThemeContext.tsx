import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';
import { THEMES, isThemeName, type ThemeName, type ThemeMeta } from '../constants/themes';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  /** quick light <-> dark switch, used by the single-icon toggles */
  toggleTheme: () => void;
  /** true for dark-based themes (dark, forest) */
  isDark: boolean;
  themes: ThemeMeta[];
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Resolve the initial theme synchronously so the first render already matches
 * the value the pre-paint script in index.html applied — no flash, no stomp.
 */
const resolveInitialTheme = (): ThemeName => {
  if (typeof document !== 'undefined') {
    const attr = document.documentElement.getAttribute('data-theme') ?? '';
    if (isThemeName(attr)) return attr;
  }
  const stored = storage.load<string>('journeyset:v1:theme', '');
  if (stored && isThemeName(stored)) return stored;
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>(resolveInitialTheme);

  useEffect(() => {
    const meta = THEMES.find(t => t.id === theme) ?? THEMES[0];
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.toggle('dark', meta.dark);
    storage.save('journeyset:v1:theme', theme);
  }, [theme]);

  const isDark = (THEMES.find(t => t.id === theme) ?? THEMES[0]).dark;

  const setTheme = (next: ThemeName) => setThemeState(next);
  const toggleTheme = () => setThemeState(isDark ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};
