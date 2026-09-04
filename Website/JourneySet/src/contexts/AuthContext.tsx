import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../utils/supabaseClient';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
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

  useEffect(() => {
    let settled = false;

    const resolve = () => {
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    };

    const timer = setTimeout(resolve, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          const tempName = session.user.email?.split('@')[0] ?? 'User';
          const metadataName = (session.user.user_metadata?.name as string | undefined) || tempName;
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            name: metadataName,
            createdAt: session.user.created_at,
          });

          supabase
            .from('profiles')
            .select('name')
            .eq('user_id', session.user.id)
            .maybeSingle()
            .then(({ data: profile }) => {
              if (profile?.name) {
                setUser(prev => (prev ? { ...prev, name: profile.name } : prev));
              } else {
                supabase
                  .from('profiles')
                  .upsert(
                    { user_id: session.user.id, email: session.user.email ?? '', name: metadataName },
                    { onConflict: 'user_id' }
                  )
                  .then(() => {
                    setUser(prev => (prev ? { ...prev, name: metadataName } : prev));
                  });
              }
            });
        } else {
          setUser(null);
        }

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
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isLoading: loading }}>
      {children}
    </AuthContext.Provider>
  );
};
