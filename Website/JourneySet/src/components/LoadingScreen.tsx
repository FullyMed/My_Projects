import React from 'react';
import { Compass, Loader2 } from 'lucide-react';

/** Full-viewport loading state shown while auth is being resolved (initial mount, protected routes). */
const LoadingScreen: React.FC = () => (
  <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4 transition-colors duration-300">
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
      <Compass className="h-6 w-6 text-on-accent" />
    </div>
    <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
  </div>
);

export default LoadingScreen;
