import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../utils/supabaseClient';
import { storage } from '../utils/storage';
import { clearLastSync } from '../api/plannerApi';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  /** Sends a password-reset email whose link lands on /reset-password. */
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  /** Sets a new password for the signed-in (or recovery-session) user. */
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  /** True after the user arrived via a password-reset email link, until they set a new password. */
  passwordRecovery: boolean;
  /** Permanently deletes the signed-in user's account and all their data. */
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    let settled = false;
    let currentUserId: string | null = null;

    const resolve = () => {
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    };

    const timer = setTimeout(resolve, 5000);

    const loadProfileName = (userId: string, email: string, metadataName: string) => {
      supabase
        .from('profiles')
        .select('name')
        .eq('user_id', userId)
        .maybeSingle()
        .then(({ data: profile }) => {
          if (profile?.name) {
            setUser(prev => (prev && prev.id === userId ? { ...prev, name: profile.name } : prev));
          } else {
            supabase
              .from('profiles')
              .upsert({ user_id: userId, email, name: metadataName }, { onConflict: 'user_id' })
              .then(() => {
                setUser(prev => (prev && prev.id === userId ? { ...prev, name: metadataName } : prev));
              });
          }
        });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // Token refreshes and tab re-focus fire this callback with the same
          // user — keep the existing object so data-loading effects keyed on
          // the user don't refetch (and flash their spinners) every time.
          if (session.user.id !== currentUserId) {
            currentUserId = session.user.id;
            const tempName = session.user.email?.split('@')[0] ?? 'User';
            const metadataName = (session.user.user_metadata?.name as string | undefined) || tempName;
            setUser({
              id: session.user.id,
              email: session.user.email ?? '',
              name: metadataName,
              createdAt: session.user.created_at,
            });

            // Supabase advises against calling other supabase methods inside
            // this callback (it runs while the auth lock is held), so defer.
            const { id, email } = session.user;
            setTimeout(() => loadProfileName(id, email ?? '', metadataName), 0);
          }
        } else {
          currentUserId = null;
          setUser(null);
        }

        // Fired when the page loads from a password-reset email link. The
        // user then has a short-lived session that is only good for setting a
        // new password, so App routes them to /reset-password.
        if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
        if (event === 'SIGNED_OUT') setPasswordRecovery(false);

        if (event === 'INITIAL_SESSION') {
          clearTimeout(timer);
          resolve();
        }
      }
    );

    return () => {
      settled = true;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name }, emailRedirectTo: window.location.origin },
      });
      if (error) return { success: false, error: error.message };
      // With email confirmation enabled, signUp succeeds without a session.
      return { success: true, needsConfirmation: !data.session };
    } catch {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const updatePassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { success: false, error: error.message };
      setPasswordRecovery(false);
      return { success: true };
    } catch {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    const userId = user?.id;
    try {
      const { error } = await supabase.auth.signOut();
      // If the server call fails (offline, project paused), still end the
      // session on this device rather than leaving the user stuck signed in.
      if (error) await supabase.auth.signOut({ scope: 'local' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    // Don't leave this user's cached data readable on a shared device.
    if (userId) storage.clearUserCache(userId);
    clearLastSync();
    setUser(null);
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    const userId = user?.id;
    try {
      // SECURITY DEFINER function (migration 20261006...): deletes auth.users
      // row for auth.uid(); every table cascades from it.
      const { error } = await supabase.rpc('delete_my_account');
      if (error) return { success: false, error: error.message };
    } catch {
      return { success: false, error: 'An unexpected error occurred' };
    }
    // The account (and so its server-side sessions) is gone; end it locally.
    await supabase.auth.signOut({ scope: 'local' });
    if (userId) storage.clearUserCache(userId);
    clearLastSync();
    setUser(null);
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        requestPasswordReset,
        updatePassword,
        passwordRecovery,
        deleteAccount,
        loading,
        isLoading: loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
