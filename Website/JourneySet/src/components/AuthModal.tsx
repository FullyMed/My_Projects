import React, { useState } from 'react';
import { X, Eye, EyeOff, Compass } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useModalFocus } from '../hooks/useModalFocus';

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitchMode: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { modalRef } = useModalFocus(true, onClose);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || 'Invalid email or password');
        } else {
          onClose();
        }
      } else {
        if (name.length < 2) {
          setError('Name must be at least 2 characters long');
          setLoading(false);
          return;
        }
        const result = await register(email, password, name);
        if (!result.success) {
          setError(result.error || 'Failed to create account');
        } else {
          onClose();
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors text-sm min-h-[48px]';

  return (
    /*
     * On mobile   → items-end  = sheet slides up from bottom
     * On sm+      → items-center = centred card
     */
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end xs:items-center justify-center xs:p-4 z-50 pb-safe"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        className={[
          'bg-white dark:bg-slate-900 w-full xs:max-w-md relative',
          'shadow-2xl shadow-black/20 border border-slate-200 dark:border-slate-800',
          /* Mobile: full-width rounded top corners + sheet animation */
          'rounded-t-2xl xs:rounded-2xl',
          'sheet-enter xs:animate-none',
          /* Let tall content scroll on small phones */
          'max-h-[92dvh] overflow-y-auto',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Drag handle on mobile */}
        <div className="flex justify-center pt-3 pb-1 xs:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Gradient accent strip — hidden on mobile (handle replaces it visually) */}
        <div className="hidden xs:block h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-t-2xl" />

        <div className="px-6 xs:px-8 pt-4 xs:pt-8 pb-6 xs:pb-8">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center justify-center mb-5 xs:mb-6">
            <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md mr-2.5">
              <Compass className="h-4 w-4 xs:h-5 xs:w-5 text-white" />
            </div>
            <span className="text-lg xs:text-xl font-bold text-slate-900 dark:text-white tracking-tight">JourneySet</span>
          </div>

          <h2
            className="text-xl xs:text-2xl font-bold text-center text-slate-900 dark:text-white mb-1"
            id="auth-modal-title"
          >
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-center text-xs xs:text-sm text-slate-500 dark:text-slate-400 mb-5 xs:mb-7">
            {mode === 'login'
              ? 'Sign in to continue your journey'
              : 'Start your productivity journey today'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="name-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Full name
                </label>
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Enter your full name"
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="Enter your email"
                required
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <div>
              <label htmlFor="password-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-0 top-0 bottom-0 min-w-[48px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-lg px-4 py-3">
                <p className="text-rose-600 dark:text-rose-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full min-h-[52px] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 cursor-pointer mt-2"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 xs:mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={onSwitchMode}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold focus:outline-none cursor-pointer"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
