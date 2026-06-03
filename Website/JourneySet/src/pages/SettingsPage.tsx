import React, { useState, useEffect } from 'react';
import { Trash2, LogOut, Moon, Sun, Check, Clock, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCompactMode } from '../contexts/CompactModeContext';
import { storage } from '../utils/storage';
import { getLastSync } from '../api/plannerApi';
import { formatDistanceToNow } from 'date-fns';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isCompact, toggleCompact } = useCompactMode();
  const [showResetModal, setShowResetModal] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const handleResetData = () => {
    if (user) {
      const plannerKey = storage.getUserKey('planner', user.id);
      const goalsKey = storage.getUserKey('goals', user.id);
      const eventsKey = storage.getUserKey('events', user.id);

      localStorage.removeItem(plannerKey);
      localStorage.removeItem(goalsKey);
      localStorage.removeItem(eventsKey);

      setShowResetModal(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    setLastSync(getLastSync());
    const interval = setInterval(() => setLastSync(getLastSync()), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl">
        {/* User Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
              <p className="text-gray-900 dark:text-white font-medium">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
              <p className="text-gray-900 dark:text-white font-medium">{user?.name}</p>
            </div>
          </div>
        </div>

        {/* Sync Status */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Data Sync</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {lastSync ? (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last synced</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {formatDistanceToNow(new Date(lastSync), { addSuffix: true })}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sync status</p>
                    <p className="text-gray-900 dark:text-white font-medium">Awaiting first sync</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isDark ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
                <span className="text-gray-700 dark:text-gray-300">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Toggle
              </button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {isCompact ? (
                  <Maximize2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Minimize2 className="h-5 w-5 text-gray-600" />
                )}
                <span className="text-gray-700 dark:text-gray-300">
                  {isCompact ? 'Compact Mode' : 'Normal Mode'}
                </span>
              </div>
              <button
                onClick={toggleCompact}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Toggle
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Danger Zone</h2>
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors border border-orange-200 dark:border-orange-900/50"
          >
            <Trash2 className="h-5 w-5" />
            <span className="font-medium">Reset All Data</span>
          </button>
        </div>

        {/* Logout */}
        <div className="p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-900/50"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Reset All Data?
            </h3>

            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              This will permanently delete all your tasks, goals, and events. This action cannot be undone.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Confirm data reset"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPage;
