import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * The URL hash as the page first loaded, captured before supabase-js parses
 * (and clears) it. ResetPasswordPage reads `error_description` from it when a
 * password-reset link has expired.
 */
export const initialUrlHash = typeof window !== 'undefined' ? window.location.hash : '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
