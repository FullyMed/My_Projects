import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string | null;
  onDismiss: () => void;
}

/** Inline, dismissible error shown when a save/delete against Supabase fails. */
const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl"
    >
      <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm text-rose-700 dark:text-rose-300">{message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="-m-2 h-9 w-9 inline-flex items-center justify-center rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-100 dark:hover:text-rose-300 dark:hover:bg-rose-900/40 transition-colors cursor-pointer flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ErrorBanner;
