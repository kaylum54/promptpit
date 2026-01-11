'use client';

import { useState, useEffect, useCallback } from 'react';
import { type ModelKey, type ModelConfig, getModelKeys, MODELS } from '@/lib/models';

const STORAGE_KEY = 'promptpit_preferences';
const CUSTOM_MODELS_KEY = 'promptpit_custom_models';

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
  customModels: ModelConfig[];
  setCustomModels: (models: ModelConfig[]) => void;
  allAvailableModels: Record<string, ModelConfig>;
  resetPreferences: () => void;
  isLoaded: boolean;
}

/**
 * Hook for managing user preferences with localStorage persistence
 */
export function usePreferences(): UsePreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [customModels, setCustomModelsState] = useState<ModelConfig[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      // Load custom models first
      const storedCustomModels = localStorage.getItem(CUSTOM_MODELS_KEY);
      if (storedCustomModels) {
        const parsed = JSON.parse(storedCustomModels) as ModelConfig[];
        setCustomModelsState(parsed);
      }

      // Load preferences
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

  // Save custom models to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CUSTOM_MODELS_KEY, JSON.stringify(customModels));
      } catch (error) {
        console.error('Failed to save custom models:', error);
      }
    }
  }, [customModels, isLoaded]);

  const setSelectedModels = useCallback((models: ModelKey[]) => {
    // Ensure at least 2 models
    if (models.length < 2) return;
    setPreferences(prev => ({ ...prev, selectedModels: models }));
  }, []);

  const setCustomModels = useCallback((models: ModelConfig[]) => {
    setCustomModelsState(models);
  }, []);

  // Combine built-in and custom models
  const allAvailableModels: Record<string, ModelConfig> = {
    ...MODELS,
    ...Object.fromEntries(customModels.map(m => [m.id, m])),
  };

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    setCustomModelsState([]);
  }, []);

  return {
    preferences,
    selectedModels: preferences.selectedModels,
    setSelectedModels,
    customModels,
    setCustomModels,
    allAvailableModels,
    resetPreferences,
    isLoaded,
  };
}

export default usePreferences;
