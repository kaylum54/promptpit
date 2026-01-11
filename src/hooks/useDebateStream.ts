'use client';

import { useState, useCallback, useRef } from 'react';
import type { DebateResponse, DebateStreamEvent } from '@/lib/types';
import { getModelKeys, type ModelKey } from '@/lib/models';

export interface PreviousRound {
  prompt: string;
  responses: Record<string, string>;
}

export interface StartDebateOptions {
  previousRounds?: PreviousRound[];
  models?: ModelKey[];
}

export interface UseDebateStreamReturn {
  responses: Record<string, DebateResponse>;
  isDebating: boolean;
  currentRound: number;
  startDebate: (prompt: string, options?: StartDebateOptions) => void;
  reset: () => void;
}

/**
 * Creates initial responses state for specified models (or all if not specified)
 */
function createInitialResponses(models?: ModelKey[]): Record<string, DebateResponse> {
  const modelKeys = models || getModelKeys();
  const responses: Record<string, DebateResponse> = {};

  for (const key of modelKeys) {
    responses[key] = {
      model: key,
      content: '',
      latency: { ttft: 0, total: 0 },
      status: 'idle',
    };
  }

  return responses;
}

/**
 * React hook for managing SSE connection to the debate API
 * Streams responses from multiple AI models simultaneously
 */
export function useDebateStream(): UseDebateStreamReturn {
  const [responses, setResponses] = useState<Record<string, DebateResponse>>(createInitialResponses);
  const [isDebating, setIsDebating] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);

  // Track first chunk timestamps for TTFT calculation
  const firstChunkTimes = useRef<Record<string, number>>({});
  const debateStartTime = useRef<number>(0);

  // AbortController for cancelling ongoing requests
  const abortController = useRef<AbortController | null>(null);

  /**
   * Reset all state back to initial values
   */
  const reset = useCallback(() => {
    // Abort any ongoing request
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }

    setResponses(createInitialResponses());
    setIsDebating(false);
    setCurrentRound(1);
    firstChunkTimes.current = {};
    debateStartTime.current = 0;
  }, []);

  /**
   * Start a new debate with the given prompt
   * @param prompt - The debate prompt
   * @param options - Optional settings including previousRounds and models
   */
  const startDebate = useCallback((prompt: string, options?: StartDebateOptions) => {
    const { previousRounds, models } = options || {};

    // Determine the round number
    const roundNumber = previousRounds && previousRounds.length > 0
      ? previousRounds.length + 1
      : 1;

    // Reset responses for selected models
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    setResponses(createInitialResponses(models));
    firstChunkTimes.current = {};

    // Update current round
    setCurrentRound(roundNumber);

    // Create new abort controller
    abortController.current = new AbortController();
    const signal = abortController.current.signal;

    // Record start time
    debateStartTime.current = Date.now();
    setIsDebating(true);

    // Start the SSE connection using fetch with ReadableStream
    const fetchDebate = async () => {
      try {
        const response = await fetch('/api/debate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            models,
            previousRounds,
            roundNumber,
          }),
          signal,
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || `HTTP error ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Decode chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE events from buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            // Skip empty lines and comments
            if (!line.trim() || line.startsWith(':')) {
              continue;
            }

            // Parse SSE data lines
            if (line.startsWith('data: ')) {
              const data = line.slice(6); // Remove 'data: ' prefix

              // Skip [DONE] marker
              if (data === '[DONE]') {
                continue;
              }

              try {
                const event: DebateStreamEvent = JSON.parse(data);
                processEvent(event);
              } catch (e) {
                console.error('Failed to parse SSE event:', data, e);
              }
            }
          }
        }
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        console.error('Debate stream error:', error);

        // Set all models to error state if connection fails
        setResponses((prev) => {
          const updated = { ...prev };
          for (const key of Object.keys(updated)) {
            if (updated[key].status === 'idle' || updated[key].status === 'streaming') {
              updated[key] = {
                ...updated[key],
                status: 'error',
                error: error instanceof Error ? error.message : 'Connection failed',
              };
            }
          }
          return updated;
        });

        setIsDebating(false);
      }
    };

    /**
     * Process a single SSE event and update state accordingly
     */
    const processEvent = (event: DebateStreamEvent) => {
      switch (event.type) {
        case 'chunk': {
          const { model, content } = event;
          const now = Date.now();

          // Track TTFT for first chunk
          if (!firstChunkTimes.current[model]) {
            firstChunkTimes.current[model] = now;
          }

          const ttft = firstChunkTimes.current[model] - debateStartTime.current;

          setResponses((prev) => ({
            ...prev,
            [model]: {
              ...prev[model],
              content: prev[model].content + content,
              status: 'streaming',
              latency: {
                ttft,
                total: now - debateStartTime.current,
              },
            },
          }));
          break;
        }

        case 'model_complete': {
          const { model, latency } = event;

          setResponses((prev) => ({
            ...prev,
            [model]: {
              ...prev[model],
              status: 'complete',
              latency,
            },
          }));
          break;
        }

        case 'error': {
          const { model, error } = event;

          setResponses((prev) => ({
            ...prev,
            [model]: {
              ...prev[model],
              status: 'error',
              error,
            },
          }));
          break;
        }

        case 'all_complete': {
          setIsDebating(false);
          break;
        }
      }
    };

    // Start the fetch
    fetchDebate();
  }, []);

  return {
    responses,
    isDebating,
    currentRound,
    startDebate,
    reset,
  };
}

export default useDebateStream;
