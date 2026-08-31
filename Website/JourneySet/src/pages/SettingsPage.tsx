import React, { useState, useEffect } from 'react';
import { Trash2, LogOut, Palette, Check, Clock, Maximize2, Minimize2, User, Wifi } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useCompactMode } from '../hooks/useCompactMode';
import { storage } from '../utils/storage';
import { getLastSync } from '../api/plannerApi';
import { formatDistanceToNow } from 'date-fns';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const { isCompact, toggleCompact } = useCompactMode();
  const [showResetModal, setShowResetModal] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const handleResetData = () => {
    if (user) {
      localStorage.removeItem(storage.getUserKey('planner', user.id));
      localStorage.removeItem(storage.getUserKey('goals', user.id));
      localStorage.removeItem(storage.getUserKey('events', user.id));
      setShowResetModal(false);
    }
  };

  useEffect(() => {
    setLastSync(getLastSync());
    const interval = setInterval(() => setLastSync(getLastSync()), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl xs:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account and preferences.</p>
        </div>

        {/* Account */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
            <User className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Account</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Email</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Name</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
            </div>
          </div>
        </section>

        {/* Sync Status */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
            <Wifi className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Data sync</h2>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center gap-3">
              {lastSync ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Synced</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDistanceToNow(new Date(lastSync), { addSuffix: true })}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Awaiting first sync</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Changes sync automatically</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Appearance</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Theme */}
            <div className="px-6 py-4">
              <div className="flex items-center gap-3 mb-3">
                <Palette className="h-4 w-4 text-indigo-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Theme</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Choose your colour theme</p>
                </div>
              </div>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2.5">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    aria-pressed={theme === t.id}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors cursor-pointer ${
                      theme === t.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <span
                      className={`w-full h-10 rounded-lg border ${t.dark ? 'border-slate-700' : 'border-slate-200'}`}
                      style={{
                        background: `linear-gradient(135deg, ${t.dark ? '#0f172a' : '#f8fafc'} 0 55%, ${t.swatch} 55% 100%)`,
                      }}
                    />
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {theme === t.id && <Check className="h-3 w-3 text-indigo-500" />}
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Compact */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isCompact ? (
                  <Maximize2 className="h-4 w-4 text-indigo-500" />
                ) : (
                  <Minimize2 className="h-4 w-4 text-slate-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{isCompact ? 'Compact mode' : 'Normal mode'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Reduce sidebar and spacing</p>
                </div>
              </div>
              <button
                onClick={toggleCompact}
                className="px-4 min-h-[44px] text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                Toggle
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-rose-100 dark:border-rose-900/40">
            <h2 className="text-sm font-semibold text-rose-600 dark:text-rose-400">Danger zone</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            <button
              onClick={() => setShowResetModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors border border-rose-200 dark:border-rose-900/50 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm font-medium">Reset all local data</span>
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors border border-rose-200 dark:border-rose-900/50 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign out</span>
            </button>
          </div>
        </section>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/20">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-base font-bold text-center text-slate-900 dark:text-white mb-2">
              Reset all data?
            </h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              This will clear your local cache. Your data in the cloud remains safe.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPage;
