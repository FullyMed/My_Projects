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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>('light');

  useEffect(() => {
    const stored = storage.load<string>('journeyset:v1:theme', '');
    if (stored && isThemeName(stored)) {
      setThemeState(stored);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    }
  }, []);

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
