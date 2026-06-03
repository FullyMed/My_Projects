import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = storage.load<string>('journeyset:v1:theme', '');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(stored ? stored === 'dark' : prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    storage.save('journeyset:v1:theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(prev => !prev) }}>
      {children}
    </ThemeContext.Provider>
  );
};
