'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-browser';

export interface UsageData {
  tier: 'guest' | 'free' | 'pro';
  debatesThisMonth: number;
  debatesLimit: number;
  debatesRemaining: number;
  canStartDebate: boolean;
  monthResetDate: string;
  isGuest: boolean;
}

export interface UseUsageReturn {
  usage: UsageData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * React hook for fetching and managing user usage data.
 * Fetches usage from /api/user/usage endpoint.
 * Auto-fetches on mount and when user changes.
 */
export function useUsage(): UseUsageReturn {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch usage data from the API
   */
  const fetchUsage = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/usage');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch usage: ${response.status}`);
      }

      const data = await response.json();
      setUsage(data as UsageData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred fetching usage data';
      setError(errorMessage);
      console.error('Error fetching usage:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Public refresh function to manually refetch usage data
   */
  const refresh = useCallback(async () => {
    await fetchUsage();
  }, [fetchUsage]);

  // Fetch on mount and listen for auth state changes
  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    fetchUsage();

    // Listen for auth state changes to refetch usage when user changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      () => {
        // Refetch usage data when auth state changes
        fetchUsage();
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUsage]);

  return {
    usage,
    isLoading,
    error,
    refresh,
  };
}

export default useUsage;
