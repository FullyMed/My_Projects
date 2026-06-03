import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  Target,
  CheckSquare,
  User,
  LogOut,
  Moon,
  Sun,
  Compass,
  Menu,
  X,
  Settings,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useCompactMode } from '../hooks/useCompactMode';
import QuoteDisplay from './QuoteDisplay';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isCompact, toggleCompact } = useCompactMode();
  const location = useLocation();

  const navigation = [
    { path: '/app/planner', name: 'Weekly Planner', icon: CheckSquare },
    { path: '/app/goals', name: 'Goal Tracker', icon: Target },
    { path: '/app/calendar', name: 'Event Calendar', icon: Calendar },
    { path: '/app/settings', name: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const sidebarWidth = isCompact ? 'w-[68px]' : 'w-64';
  const mainOffset = isCompact ? 'lg:ml-[68px]' : 'lg:ml-64';

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:translate-x-0 z-50 flex flex-col ${sidebarWidth} ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pt-safe ${isCompact ? 'px-3 py-4 justify-center' : 'px-5 py-4'}`}>
          <Link
            to="/"
            className={`flex items-center hover:opacity-80 transition-opacity ${isCompact ? '' : 'space-x-2.5'}`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm flex-shrink-0">
              <Compass className="h-4 w-4 text-white" />
            </div>
            {!isCompact && (
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">JourneySet</span>
            )}
          </Link>
          {!isCompact && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* User Info */}
        <div className={`border-b border-slate-100 dark:border-slate-800 ${isCompact ? 'px-3 py-3 flex justify-center' : 'px-5 py-4'}`}>
          {isCompact ? (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto ${isCompact ? 'px-2 py-4' : 'px-3 py-4'}`}>
          <ul className="space-y-0.5">
            {navigation.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path} title={isCompact ? item.name : undefined}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center rounded-lg transition-all duration-150 cursor-pointer min-h-[44px] ${
                      isCompact ? 'px-2 justify-center' : 'px-3 space-x-3'
                    } ${
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
                    />
                    {!isCompact && (
                      <span className={`text-sm font-medium flex-1 ${active ? 'text-indigo-700 dark:text-indigo-300' : ''}`}>
                        {item.name}
                      </span>
                    )}
                    {!isCompact && active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className={`border-t border-slate-100 dark:border-slate-800 pb-safe ${isCompact ? 'px-2 py-2 space-y-0.5' : 'px-3 py-2 space-y-0.5'}`}>
          <button
            onClick={toggleTheme}
            title={`Toggle ${isDark ? 'light' : 'dark'} mode`}
            className={`w-full flex items-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer min-h-[44px] ${
              isCompact ? 'px-2 justify-center' : 'px-3 space-x-3'
            }`}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-500 flex-shrink-0" />
            ) : (
              <Moon className="h-4 w-4 flex-shrink-0" />
            )}
            {!isCompact && <span className="text-sm font-medium">{isDark ? 'Light mode' : 'Dark mode'}</span>}
          </button>

          <button
            onClick={toggleCompact}
            title={`Toggle ${isCompact ? 'normal' : 'compact'} mode`}
            className={`w-full flex items-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer min-h-[44px] ${
              isCompact ? 'px-2 justify-center' : 'px-3 space-x-3'
            }`}
          >
            {isCompact ? (
              <Maximize2 className="h-4 w-4 flex-shrink-0" />
            ) : (
              <Minimize2 className="h-4 w-4 flex-shrink-0" />
            )}
            {!isCompact && <span className="text-sm font-medium">Compact mode</span>}
          </button>

          <button
            onClick={logout}
            className={`w-full flex items-center rounded-lg text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer min-h-[44px] ${
              isCompact ? 'px-2 justify-center' : 'px-3 space-x-3'
            }`}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCompact && <span className="text-sm font-medium">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className={`${mainOffset} flex flex-col min-h-dvh`}>
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/70 sticky top-0 z-40 pt-safe">
          <div className={`flex items-center gap-3 ${isCompact ? 'px-4 py-3' : 'px-4 xs:px-6 py-3.5'}`}>
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1" />
            <QuoteDisplay compact={isCompact} />
          </div>
        </header>

        {/* Page content */}
        <main className={`flex-1 pb-safe ${isCompact ? 'p-3 xs:p-4' : 'p-4 xs:p-5 sm:p-6 lg:p-8'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
