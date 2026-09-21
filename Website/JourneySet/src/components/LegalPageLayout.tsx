import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

/** Shared nav/footer chrome + prose styling for standalone legal pages (Terms, Privacy). */
const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, lastUpdated, children }) => {
  const { user } = useAuth();
  const homePath = user ? '/app/planner' : '/';

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col">
      <nav className="border-b border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md pt-safe">
        <div className="max-w-7xl mx-auto pl-safe pr-safe">
          <div className="flex items-center justify-between px-4 xs:px-6 py-3.5">
            <Link to="/" className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm flex-shrink-0">
                <Compass className="h-4 w-4 text-on-accent" />
              </div>
              <span className="text-lg xs:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                JourneySet
              </span>
            </Link>
            <Link
              to={homePath}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden xs:inline">{user ? 'Back to Planner' : 'Back to Home'}</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 xs:px-6 py-10 xs:py-14">
        <h1 className="text-2xl xs:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          {title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 xs:mb-10">
          Last updated: {lastUpdated}
        </p>

        <div className="space-y-8 text-sm xs:text-base text-slate-600 dark:text-slate-400 leading-relaxed [&_h2]:text-lg [&_h2]:xs:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:dark:text-white [&_h2]:mb-3 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:leading-relaxed [&_a]:text-indigo-600 [&_a]:dark:text-indigo-400 [&_a]:hover:underline [&_strong]:text-slate-800 [&_strong]:dark:text-slate-200 [&_strong]:font-semibold [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:bg-slate-100 [&_code]:dark:bg-slate-800 [&_code]:text-slate-700 [&_code]:dark:text-slate-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded">
          {children}
        </div>
      </div>

      <footer className="border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="max-w-7xl mx-auto px-4 xs:px-6 py-6 flex flex-col xs:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Compass className="h-3.5 w-3.5 text-on-accent" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">JourneySet</span>
          </div>
          <div className="flex items-center gap-4 text-xs xs:text-sm text-slate-500 dark:text-slate-400">
            <Link to="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Use</Link>
            <Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LegalPageLayout;
