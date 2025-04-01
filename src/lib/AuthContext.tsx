import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { ensureUserExists } from './api'; // Import the new function

interface AuthContextType {
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isOnboarding: boolean;
  setIsOnboarding: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Determine the redirect URL based on the environment
  const getRedirectUrl = () => {
    const isDevelopment = import.meta.env.DEV;
    return isDevelopment 
      ? 'http://localhost:5173/'
      : 'https://pasinterns.vercel.app/';
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("session",session);
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      console.log("user in auth",currentUser );
      
      // If we have a user, ensure they exist in our custom table
      if (currentUser?.id && currentUser?.email) {
        ensureUserExists(currentUser.id, currentUser.email,currentUser.user_metadata.full_name, currentUser.user_metadata.avatar_url);
      }
      
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // If we have a user, ensure they exist in our custom table
      if (currentUser?.id && currentUser?.email) {
        ensureUserExists(currentUser.id, currentUser.email,currentUser.user_metadata.full_name, currentUser.user_metadata.avatar_url);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) {
        if (error.message.includes('provider is not enabled')) {
          throw new Error('Google sign-in is not currently enabled. Please ensure Google OAuth is configured in your Supabase project settings.');
        }
        throw error;
      }
      
      // Set onboarding flag when user signs in
      setIsOnboarding(true);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsOnboarding(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        signInWithGoogle, 
        signOut, 
        loading, 
        isOnboarding, 
        setIsOnboarding 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}