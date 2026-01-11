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

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        // Fetch profile if user is logged in
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Fetch profile when user signs in
          await fetchProfile(currentUser.id);
        } else {
          // Clear profile when user signs out
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return {};
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
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfile(null);
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
