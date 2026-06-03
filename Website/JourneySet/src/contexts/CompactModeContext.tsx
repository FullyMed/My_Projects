import React, { createContext, useContext, useEffect, useState } from 'react';

interface CompactModeContextType {
  isCompact: boolean;
  toggleCompact: () => void;
}

const CompactModeContext = createContext<CompactModeContextType | undefined>(undefined);

export const CompactModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCompact, setIsCompact] = useState(() => {
    const saved = localStorage.getItem('journeyset_compact_mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('journeyset_compact_mode', JSON.stringify(isCompact));
  }, [isCompact]);

  const toggleCompact = () => setIsCompact(prev => !prev);

  return (
    <CompactModeContext.Provider value={{ isCompact, toggleCompact }}>
      {children}
    </CompactModeContext.Provider>
  );
};

export const useCompactMode = () => {
  const context = useContext(CompactModeContext);
  if (!context) {
    throw new Error('useCompactMode must be used within CompactModeProvider');
  }
  return context;
};
