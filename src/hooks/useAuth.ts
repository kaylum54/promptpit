'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-browser';
import type { PromptPitProfile } from '@/lib/types';

export interface UseAuthReturn {
  user: User | null;
  profile: PromptPitProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * React hook for managing Supabase authentication state.
 * Listens to auth state changes and provides sign in/up/out methods.
 * Also fetches and manages the user's PromptPit profile.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PromptPitProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch profile from promptpit_profiles table
   * If profile doesn't exist, creates one via API
   */
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const supabase = createClient();

      // Try to fetch existing profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingProfile, error } = await (supabase as any)
        .from('promptpit_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which we handle below
        console.error('Error fetching profile:', error);
        return;
      }

      if (existingProfile) {
        setProfile(existingProfile as PromptPitProfile);
        return;
      }

      // Profile doesn't exist, create it via API
      const response = await fetch('/api/user/ensure-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile as PromptPitProfile);
      } else {
        console.error('Error creating profile:', await response.text());
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  }, []);

  /**
   * Refresh the profile data from the database
   */
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    const supabase = createClient();

    // Timeout to prevent infinite loading (8 second max)
    const timeout = setTimeout(() => {
      console.warn('Auth loading timed out, setting to not loading');
      setIsLoading(false);
    }, 8000);

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        // Set loading to false immediately after getting user
        // Profile fetch happens in background
        setIsLoading(false);
        clearTimeout(timeout);

        // Fetch profile if user is logged in (non-blocking)
        if (currentUser) {
          fetchProfile(currentUser.id).catch(err => {
            console.error('Background profile fetch failed:', err);
          });
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
        setProfile(null);
        clearTimeout(timeout);
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setIsLoading(false);

        if (currentUser) {
          // Fetch profile in background (non-blocking)
          fetchProfile(currentUser.id).catch(err => {
            console.error('Profile fetch failed:', err);
          });
        } else {
          // Clear profile when user signs out
          setProfile(null);
        }
      }
    );

    // Cleanup subscription and timeout on unmount
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [fetchProfile]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    const supabase = createClient();

    try {
      // Add timeout to prevent infinite hanging
      const timeoutPromise = new Promise<{ error: string }>((_, reject) =>
        setTimeout(() => reject(new Error('Sign in timed out. Please try again.')), 15000)
      );

      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { error } = await Promise.race([signInPromise, timeoutPromise]);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign in failed. Please try again.' };
    }
  }, []);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  }, []);

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      const supabase = createClient();

      // Clear local state immediately for responsive UI
      setUser(null);
      setProfile(null);

      // Then sign out from Supabase (with timeout)
      const timeoutPromise = new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Sign out timed out')), 5000)
      );

      await Promise.race([
        supabase.auth.signOut(),
        timeoutPromise
      ]);
    } catch (err) {
      console.error('Sign out error:', err);
      // Still clear local state even if Supabase call fails
      setUser(null);
      setProfile(null);
    }
  }, []);

  return {
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };
}

export default useAuth;
