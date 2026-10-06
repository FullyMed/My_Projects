import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Eye, EyeOff, KeyRound, Loader2, Home } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../hooks/usePageMeta';
import { initialUrlHash } from '../utils/supabaseClient';

/**
 * Landing page for the password-reset email link. Supabase turns the link's
 * URL hash into a short-lived recovery session (AuthContext sees the
 * PASSWORD_RECOVERY event and App routes here); the user then picks a new
 * password. An expired/used link arrives with `#error_description=...` instead.
 */
const linkError = (() => {
  const params = new URLSearchParams(initialUrlHash.replace(/^#/, ''));
  return params.get('error_description')?.replace(/\+/g, ' ') ?? null;
})();

const ResetPasswordPage: React.FC = () => {
  usePageMeta('Reset Password | JourneySet', 'Choose a new password for your JourneySet account.');
  const { user, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setSaving(true);
    const result = await updatePassword(password);
    setSaving(false);
    if (!result.success) {
      setError(result.error || "Couldn't update your password. Please try again.");
      return;
    }
    navigate('/app/planner', { replace: true });
  };

  const inputClass =
    'w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors text-sm min-h-[48px]';

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

      <main className="flex-1 flex items-center justify-center px-4 xs:px-6 py-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-6 xs:p-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
            <KeyRound className="h-5 w-5 text-on-accent" />
          </div>

          {user ? (
            <>
              <h1 className="text-xl xs:text-2xl font-bold text-center text-slate-900 dark:text-white mb-1">
                Choose a new password
              </h1>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6 break-all">
                for {user.email}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`${inputClass} pr-12`}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      minLength={8}
                      required
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
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className={inputClass}
                    autoComplete="new-password"
                    required
                  />
                </div>

                {error && (
                  <div role="alert" className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-lg px-4 py-3">
                    <p className="text-rose-600 dark:text-rose-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-on-accent rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm shadow-indigo-500/25 cursor-pointer"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? 'Saving…' : 'Update password'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <h1 className="text-xl xs:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                This reset link isn't valid
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {linkError ? `${linkError}. ` : 'It may have expired or already been used. '}
                Request a new one from <strong className="text-slate-700 dark:text-slate-300">Sign in → Forgot password?</strong>
              </p>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 min-h-[48px] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-on-accent rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm shadow-indigo-500/25"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
