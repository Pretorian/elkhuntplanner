import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Supabase not configured. Authentication features will be disabled.\n' +
    'To enable authentication:\n' +
    '1. Create a Supabase project at https://supabase.com\n' +
    '2. Copy .env.example to .env\n' +
    '3. Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\n' +
    '4. See SUPABASE_SETUP.md for detailed instructions'
  );
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Helper: Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Helper: Get current user
export const getCurrentUser = async () => {
  if (!supabase) return null;

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user:', error.message);
    return null;
  }

  return user;
};

// Helper: Sign up with email and password
export const signUp = async (email, password, metadata = {}) => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) throw error;

  return data;
};

// Helper: Sign in with email and password
export const signIn = async (email, password) => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
};

// Helper: Sign out
export const signOut = async () => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.auth.signOut();

  if (error) throw error;
};

// Helper: Reset password (send email)
export const resetPassword = async (email) => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
};

// Helper: Update password
export const updatePassword = async (newPassword) => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
};

// Helper: Listen for auth state changes
export const onAuthStateChange = (callback) => {
  if (!supabase) return () => {};

  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);

  return () => subscription.unsubscribe();
};
