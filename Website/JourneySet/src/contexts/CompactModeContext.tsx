import React, { createContext, useEffect, useState } from 'react';

interface CompactModeContextType {
  isCompact: boolean;
  toggleCompact: () => void;
}

export const CompactModeContext = createContext<CompactModeContextType | undefined>(undefined);

export const CompactModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCompact, setIsCompact] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('journeyset_compact_mode') ?? 'false') as boolean;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('journeyset_compact_mode', JSON.stringify(isCompact));
  }, [isCompact]);

  return (
    <CompactModeContext.Provider value={{ isCompact, toggleCompact: () => setIsCompact(prev => !prev) }}>
      {children}
    </CompactModeContext.Provider>
  );
};
