import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Target, CheckSquare, Moon, Sun, BarChart3, Download, Compass, ArrowRight, Zap, Globe } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { usePageMeta } from '../hooks/usePageMeta';

interface LandingPageProps {
  onShowAuth: (mode: 'login' | 'register') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onShowAuth }) => {
  usePageMeta(
    'JourneySet | Free weekly planner',
    'Plan your week, track goals and keep a calendar of events. JourneySet is free and works in your browser.'
  );
  const { isDark, toggleTheme } = useTheme();

  const features = [
    {
      icon: CheckSquare,
      title: 'Weekly planner',
      description: 'Add tasks to any day, with an optional time. Mark a task as weekly and JourneySet copies it into next week for you.',
      color: 'bg-blue-500',
    },
    {
      icon: Target,
      title: 'Goal tracker',
      description: 'Set a target in any unit, like 10 runs or 200 pages, and press +1 as you go. The bar shows how close you are.',
      color: 'bg-fuchsia-500',
    },
    {
      icon: Calendar,
      title: 'Event calendar',
      description: 'See the whole month at once. JourneySet warns you when two events land on the same time.',
      color: 'bg-emerald-500',
    },
    {
      icon: BarChart3,
      title: 'Progress at a glance',
      description: 'The goals page counts how many you have finished, and each printed week shows how many tasks you ticked off.',
      color: 'bg-sky-500',
    },
    {
      icon: Download,
      title: 'Print or save as PDF',
      description: 'Print your week, your goals or a month of events, or save any of them as a PDF from the print window.',
      color: 'bg-amber-500',
    },
    {
      icon: isDark ? Sun : Moon,
      title: 'Five colour themes',
      description: 'Pick Light, Dark, Sky, Gold or Forest. This browser remembers the one you choose.',
      color: 'bg-rose-500',
    },
  ];

  // Product facts, not usage numbers. Keep these true.
  const stats = [
    { label: 'Planner, goals & calendar', value: '3-in-1' },
    { label: 'Colour themes', value: '5' },
    { label: 'Free to use', value: '$0' },
  ];

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* ── Navigation ─────────────────────────────────────── */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:px-4 focus:py-2.5 focus:rounded-lg focus:bg-white focus:text-slate-900 focus:shadow-card-hover"
      >
        Skip to content
      </a>
      <nav className="sticky top-0 z-50 border-b border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md pt-safe">
        <div className="max-w-7xl mx-auto pl-safe pr-safe">
          <div className="flex items-center justify-between px-4 xs:px-6 py-3.5">
            {/* Logo */}
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm flex-shrink-0">
                <Compass className="h-4 w-4 text-on-accent" />
              </div>
              <span className="text-lg xs:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                JourneySet
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 xs:gap-2 flex-shrink-0">
              <button
                onClick={toggleTheme}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-150 cursor-pointer"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* "Sign in" hidden below xs to prevent nav overflow */}
              <button
                onClick={() => onShowAuth('login')}
                className="hidden xs:inline-flex items-center px-4 min-h-[44px] text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                Sign in
              </button>

              <button
                onClick={() => onShowAuth('register')}
                className="inline-flex items-center justify-center px-4 xs:px-5 min-h-[44px] text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-on-accent rounded-lg transition duration-200 shadow-sm shadow-indigo-500/25 cursor-pointer"
              >
                <span className="xs:hidden">Join</span>
                <span className="hidden xs:inline">Get started</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main id="main" tabIndex={-1} className="focus:outline-none">
      {/* ── Hero ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] xs:w-[800px] md:w-[900px] h-[400px] md:h-[600px] bg-gradient-to-b from-indigo-100/70 via-violet-50/30 to-transparent dark:from-indigo-950/50 dark:via-violet-950/20 dark:to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 xs:px-6 pt-14 xs:pt-20 md:pt-24 pb-14 xs:pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs xs:text-sm font-medium mb-6 xs:mb-8">
            <Zap className="h-3 w-3 xs:h-3.5 xs:w-3.5" />
            <span>Tasks, goals and events in one place</span>
          </div>

          {/* Headline: scales from 375 px up to 1440 px */}
          <h1 className="text-balance text-[2.25rem] leading-[1.1] xs:text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-4 xs:mb-6 tracking-tight">
            Plan your week
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
              and keep your goals in sight
            </span>
          </h1>

          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 xs:mb-10 max-w-2xl mx-auto leading-relaxed px-2 xs:px-0">
            Add tasks to each day, count your way towards a goal and keep your appointments on a monthly calendar.
          </p>

          {/* CTAs: stacked on mobile, side by side on xs+ */}
          <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 justify-center mb-12 xs:mb-16 px-4 xs:px-0">
            <button
              onClick={() => onShowAuth('register')}
              className="group inline-flex items-center justify-center gap-2 w-full xs:w-auto px-6 xs:px-8 min-h-[52px] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-on-accent rounded-xl font-semibold text-base transition duration-200 shadow-lg shadow-indigo-500/30 cursor-pointer"
            >
              Start for free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-150" />
            </button>
            <button
              onClick={() => onShowAuth('login')}
              className="inline-flex items-center justify-center gap-2 w-full xs:w-auto px-6 xs:px-8 min-h-[52px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-xl font-semibold text-base transition duration-200 cursor-pointer"
            >
              Sign in
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 xs:gap-10 md:gap-20">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl xs:text-3xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs xs:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 xs:px-6 py-14 xs:py-20">
        <div className="text-center mb-10 xs:mb-14">
          <h2 className="text-balance text-2xl xs:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 xs:mb-4 tracking-tight">
            What you get
          </h2>
          <p className="text-sm xs:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            A planner, a goal tracker and a calendar, plus printing and themes.
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-5 xs:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:shadow-card-hover transition duration-300"
            >
              <div className={`w-10 h-10 xs:w-11 xs:h-11 ${feature.color} rounded-xl flex items-center justify-center mb-3 xs:mb-4 shadow-sm`}>
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-sm xs:text-base font-semibold text-slate-900 dark:text-white mb-1.5 xs:mb-2">
                {feature.title}
              </h3>
              <p className="text-xs xs:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 xs:px-6 pb-16 xs:pb-24">
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl xs:rounded-3xl p-8 xs:p-12 md:p-16 text-on-accent text-center">
          <div className="absolute top-0 right-0 w-60 xs:w-80 h-60 xs:h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 xs:w-80 h-60 xs:h-80 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          <Globe className="h-8 w-8 xs:h-10 xs:w-10 mx-auto mb-4 xs:mb-6 opacity-75" />
          <h2 className="text-balance text-2xl xs:text-3xl md:text-4xl font-bold mb-3 xs:mb-4 tracking-tight">
            Ready to get organised?
          </h2>
          <p className="text-sm xs:text-base text-on-accent/80 mb-6 xs:mb-8 max-w-xl mx-auto">
            It's free, and you can delete your account at any time.
          </p>
          <button
            onClick={() => onShowAuth('register')}
            className="inline-flex items-center gap-2 w-full xs:w-auto justify-center px-6 xs:px-8 min-h-[52px] bg-white text-indigo-700 rounded-xl font-semibold text-sm xs:text-base hover:bg-slate-50 transition-colors shadow-lg cursor-pointer"
          >
            Create your free account
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="max-w-7xl mx-auto px-4 xs:px-6 py-6 xs:py-8 flex flex-col xs:flex-row justify-between items-center gap-3 xs:gap-4">
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
          <p className="text-xs xs:text-sm text-slate-500 dark:text-slate-400">
            A free planner for your week.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
