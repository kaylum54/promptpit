'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import type { PromptPitProfile } from '@/lib/types';

// Auth0 user type from the client SDK
export interface Auth0ClientUser {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  nickname?: string;
  picture?: string;
  updated_at?: string;
}

export interface UseAuthReturn {
  user: Auth0ClientUser | null;
  profile: PromptPitProfile | null;
  isLoading: boolean;
  error?: Error;
  signIn: (returnTo?: string) => void;
  signUp: (returnTo?: string) => void;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

/**
 * React hook for managing Auth0 authentication state.
 * Uses Auth0's useUser hook and fetches PromptPit profile from API.
 */
export function useAuth(): UseAuthReturn {
  const { user: auth0User, isLoading: auth0Loading, error } = useUser();
  const [profile, setProfile] = useState<PromptPitProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  /**
   * Fetch profile from API
   */
  const fetchProfile = useCallback(async () => {
    if (!auth0User?.sub) return;

    setProfileLoading(true);
    try {
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
        console.error('Error fetching profile:', await response.text());
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    } finally {
      setProfileLoading(false);
    }
  }, [auth0User?.sub]);

  /**
   * Refresh the profile data
   */
  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  // Fetch profile when user changes
  useEffect(() => {
    if (auth0User?.sub && !profile) {
      fetchProfile();
    } else if (!auth0User) {
      setProfile(null);
    }
  }, [auth0User, profile, fetchProfile]);

  /**
   * Redirect to Auth0 login page
   * In v4, the login route is /auth/login (not /api/auth/login)
   * Uses returnTo parameter to redirect to dashboard after login
   */
  const signIn = useCallback((returnTo: string = '/dashboard') => {
    const params = new URLSearchParams();
    params.set('returnTo', returnTo);
    window.location.href = `/auth/login?${params.toString()}`;
  }, []);

  /**
   * Redirect to Auth0 signup page
   * In v4, use screen_hint=signup query param
   * Uses returnTo parameter to redirect to login with verify=pending after signup
   * This allows showing an email verification message
   */
  const signUp = useCallback((returnTo: string = '/login?verify=pending') => {
    const params = new URLSearchParams();
    params.set('screen_hint', 'signup');
    params.set('returnTo', returnTo);
    window.location.href = `/auth/login?${params.toString()}`;
  }, []);

  /**
   * Sign out and redirect to home
   * In v4, the logout route is /auth/logout
   */
  const signOut = useCallback(() => {
    setProfile(null);
    window.location.href = '/auth/logout';
  }, []);

  return {
    user: auth0User as Auth0ClientUser | null,
    profile,
    isLoading: auth0Loading || profileLoading,
    error: error as Error | undefined,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };
}

export default useAuth;
