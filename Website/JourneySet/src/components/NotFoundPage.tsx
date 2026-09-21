import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft, MapPinOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../hooks/usePageMeta';

interface NotFoundPageProps {
  /** false when rendered inside AppLayout, which already provides nav/sidebar/footer chrome */
  fullPage?: boolean;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ fullPage = true }) => {
  usePageMeta(
    'Page Not Found | JourneySet',
    "The page you're looking for doesn't exist or may have been moved."
  );
  const { user } = useAuth();
  const homePath = user ? '/app/planner' : '/';
  const homeLabel = user ? 'Back to Planner' : 'Back to Home';

  const content = (
    <div className="flex flex-col items-center justify-center text-center px-4 xs:px-6 py-16 xs:py-24">
      <div className="relative mb-6 xs:mb-8">
        <div className="absolute inset-0 -z-10 blur-3xl bg-gradient-to-br from-indigo-200/60 to-violet-200/40 dark:from-indigo-950/50 dark:to-violet-950/30 rounded-full" />
        <div className="w-16 h-16 xs:w-20 xs:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <MapPinOff className="h-8 w-8 xs:h-10 xs:w-10 text-on-accent" />
        </div>
      </div>

      <p className="text-6xl xs:text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent tracking-tight mb-2 xs:mb-3">
        404
      </p>
      <h1 className="text-xl xs:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 xs:mb-3 tracking-tight">
        Looks like this page wandered off route
      </h1>
      <p className="text-sm xs:text-base text-slate-600 dark:text-slate-400 max-w-md mb-8 xs:mb-10">
        The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
      </p>

      <div className="flex flex-col xs:flex-row gap-3 w-full xs:w-auto px-4 xs:px-0">
        <Link
          to={homePath}
          className="inline-flex items-center justify-center gap-2 w-full xs:w-auto px-6 min-h-[48px] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-on-accent rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm shadow-indigo-500/25 cursor-pointer"
        >
          <Home className="h-4 w-4" />
          {homeLabel}
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center gap-2 w-full xs:w-auto px-6 min-h-[48px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>
      </div>
    </div>
  );

  if (!fullPage) {
    return <div className="min-h-[60vh] flex items-center justify-center">{content}</div>;
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col">
      <nav className="border-b border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md pt-safe">
        <div className="max-w-7xl mx-auto pl-safe pr-safe">
          <div className="flex items-center px-4 xs:px-6 py-3.5">
            <Link to="/" className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm flex-shrink-0">
                <Compass className="h-4 w-4 text-on-accent" />
              </div>
              <span className="text-lg xs:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                JourneySet
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center">{content}</div>

      <footer className="border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="max-w-7xl mx-auto px-4 xs:px-6 py-6 flex justify-center">
          <p className="text-xs xs:text-sm text-slate-400 dark:text-slate-600">
            Your personal productivity companion.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NotFoundPage;
