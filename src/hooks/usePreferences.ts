'use client';

import { useState, useEffect, useCallback } from 'react';
import { type ModelKey, getModelKeys } from '@/lib/models';

const STORAGE_KEY = 'promptpit_preferences';

export interface UserPreferences {
  selectedModels: ModelKey[];
}

const defaultPreferences: UserPreferences = {
  selectedModels: getModelKeys(), // All models by default
};

export interface UsePreferencesReturn {
  preferences: UserPreferences;
  selectedModels: ModelKey[];
  setSelectedModels: (models: ModelKey[]) => void;
  resetPreferences: () => void;
  isLoaded: boolean;
}

/**
 * Hook for managing user preferences with localStorage persistence
 */
export function usePreferences(): UsePreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<UserPreferences>;
        // Validate stored models - filter out any that no longer exist
        const validModels = getModelKeys();
        const selectedModels = parsed.selectedModels?.filter(
          (m): m is ModelKey => validModels.includes(m as ModelKey)
        ) || defaultPreferences.selectedModels;

        // Ensure at least 2 models are selected
        if (selectedModels.length < 2) {
          setPreferences(defaultPreferences);
        } else {
          setPreferences({ ...defaultPreferences, ...parsed, selectedModels });
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.error('Failed to save preferences:', error);
      }
    }
  }, [preferences, isLoaded]);

  const setSelectedModels = useCallback((models: ModelKey[]) => {
    // Ensure at least 2 models
    if (models.length < 2) return;
    setPreferences(prev => ({ ...prev, selectedModels: models }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, []);

  return {
    preferences,
    selectedModels: preferences.selectedModels,
    setSelectedModels,
    resetPreferences,
    isLoaded,
  };
}

export default usePreferences;
