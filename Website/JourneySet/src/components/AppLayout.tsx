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
  Minimize2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCompactMode } from '../contexts/CompactModeContext';
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

  const handleLogout = async () => {
    await logout();
  };

  const navigation = [
    { path: '/app/planner', name: 'Weekly Planner', icon: CheckSquare },
    { path: '/app/goals', name: 'Goal Tracker', icon: Target },
    { path: '/app/calendar', name: 'Event Calendar', icon: Calendar },
    { path: '/app/settings', name: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isCompact ? 'w-56' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center justify-between border-b border-gray-200 dark:border-gray-700 ${isCompact ? 'px-4 py-4' : 'p-6'}`}>
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Compass className={`text-blue-600 dark:text-blue-400 ${isCompact ? 'h-6 w-6' : 'h-8 w-8'}`} />
              {!isCompact && <span className="text-xl font-bold text-gray-900 dark:text-white">JourneySet</span>}
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* User Info */}
          <div className={`border-b border-gray-200 dark:border-gray-700 ${isCompact ? 'px-4 py-3' : 'p-6'}`}>
            <div className="flex items-center space-x-3">
              <div className={`bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 ${isCompact ? 'w-8 h-8' : 'w-10 h-10'}`}>
                <User className={`text-white ${isCompact ? 'h-4 w-4' : 'h-6 w-6'}`} />
              </div>
              {!isCompact && (
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 ${isCompact ? 'px-2 py-3' : 'px-6 py-4'}`}>
            <ul className={isCompact ? 'space-y-1' : 'space-y-2'}>
              {navigation.map((item) => (
                <li key={item.path} title={isCompact ? item.name : ''}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center rounded-lg transition-colors ${
                      isCompact ? 'p-3 justify-center' : 'space-x-3 px-4 py-3'
                    } ${
                      isActive(item.path)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!isCompact && <span className="font-medium">{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className={`border-t border-gray-200 dark:border-gray-700 ${isCompact ? 'px-2 py-3 space-y-1' : 'p-6 space-y-3'}`}>
            <div className="flex items-center justify-between">
              {!isCompact && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>}
              <button
                onClick={toggleTheme}
                title={`Toggle ${isDark ? 'light' : 'dark'} mode`}
                className={`hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${isCompact ? 'w-full p-3 flex justify-center' : 'p-2'}`}
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
            <button
              onClick={toggleCompact}
              title={`Toggle ${isCompact ? 'normal' : 'compact'} mode`}
              className={`w-full flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${isCompact ? 'p-3 justify-center' : 'space-x-3 px-4 py-3'}`}
            >
              {isCompact ? (
                <Maximize2 className="h-5 w-5" />
              ) : (
                <>
                  <Minimize2 className="h-5 w-5" />
                  <span className="font-medium">Compact</span>
                </>
              )}
            </button>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ${isCompact ? 'p-3 justify-center' : 'space-x-3 px-4 py-3'}`}
            >
              <LogOut className="h-5 w-5" />
              {!isCompact && <span className="font-medium">Sign Out</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${isCompact ? 'lg:ml-56' : 'lg:ml-64'} flex flex-col min-h-screen`}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className={`flex items-center justify-between ${isCompact ? 'px-4 py-3' : 'px-6 py-4'}`}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex-1 ml-4 lg:ml-0" />
            <QuoteDisplay compact={isCompact} />
          </div>
        </header>

        {/* Content */}
        <main className={`flex-1 ${isCompact ? 'p-4' : 'p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
