import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { getRandomQuote } from '../data/quotes';
import { Quote as QuoteType } from '../types';
import { storage } from '../utils/storage';

interface QuoteDisplayProps {
  compact?: boolean;
}

const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ compact = false }) => {
  const [quote, setQuote] = useState<QuoteType>(getRandomQuote());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshQuote = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setQuote(getRandomQuote());
      setIsRefreshing(false);
    }, 300);
  };

  useEffect(() => {
    const lastQuoteDate = storage.load<string>('journeyset:v1:lastQuoteDate', '');
    const today = new Date().toDateString();
    if (lastQuoteDate !== today) {
      setQuote(getRandomQuote());
      storage.save('journeyset:v1:lastQuoteDate', today);
    }
  }, []);

  // Compact mode has no room for the quote, and on phones it's hidden too, so
  // don't leave a refresh button for a quote nobody can see.
  if (compact) return null;

  return (
    <div className="hidden sm:flex items-center gap-3 max-w-sm">
      <div className="text-right min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1">"{quote.text}"</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{quote.author}</p>
      </div>
      <button
        onClick={refreshQuote}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition duration-200 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0 cursor-pointer"
        title="New quote"
        aria-label="Show another quote"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

export default QuoteDisplay;
