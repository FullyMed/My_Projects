import { useContext } from 'react';
import { CompactModeContext } from '../contexts/CompactModeContext';

export const useCompactMode = () => {
  const context = useContext(CompactModeContext);
  if (!context) {
    throw new Error('useCompactMode must be used within CompactModeProvider');
  }
  return context;
};
