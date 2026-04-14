import { createContext, useContext, useState, useEffect } from 'react';
import {
  isSupabaseConfigured,
  getCurrentUser,
  signUp as supabaseSignUp,
  signIn as supabaseSignIn,
  signOut as supabaseSignOut,
  onAuthStateChange,
} from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if Supabase is configured
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);

    if (!configured) {
      setLoading(false);
      return;
    }

    // Get initial session
    getCurrentUser()
      .then(user => {
        setUser(user);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading user session:', error);
        setLoading(false);
      });

    // Listen for auth changes
    const unsubscribe = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signUp = async (email, password, metadata = {}) => {
    if (!isConfigured) {
      throw new Error('Authentication is not configured. Please set up Supabase.');
    }

    try {
      const data = await supabaseSignUp(email, password, metadata);
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    if (!isConfigured) {
      throw new Error('Authentication is not configured. Please set up Supabase.');
    }

    try {
      const data = await supabaseSignIn(email, password);
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!isConfigured) {
      throw new Error('Authentication is not configured. Please set up Supabase.');
    }

    try {
      await supabaseSignOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isConfigured,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
