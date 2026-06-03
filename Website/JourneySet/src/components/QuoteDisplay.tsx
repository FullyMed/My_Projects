import React, { useState, useEffect } from 'react';
import { Quote, RefreshCw } from 'lucide-react';
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

  return (
    <div className={`flex items-center ${compact ? 'space-x-2' : 'space-x-4 max-w-md'}`}>
      {!compact && (
        <div className="flex items-center space-x-2">
          <Quote className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div className="text-sm hidden sm:block">
            <p className="text-gray-700 dark:text-gray-300 italic line-clamp-1">"{quote.text}"</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">— {quote.author}</p>
          </div>
        </div>
      )}
      {compact && (
        <Quote className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      )}
      <button
        onClick={refreshQuote}
        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 ${
          isRefreshing ? 'animate-spin' : ''
        }`}
        title="Get new quote"
      >
        <RefreshCw className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  );
};

export default QuoteDisplay;