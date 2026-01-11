'use client';

import { useState, useCallback, useRef } from 'react';
import type { ModelScores, JudgeVerdict, JudgeStreamEvent } from '@/lib/types';

export interface UseJudgeStreamReturn {
  scores: Record<string, ModelScores>;  // { "Claude": { reasoning: {...}, clarity: {...}, ... }, ... }
  verdict: JudgeVerdict | null;
  currentTool: string | null;  // Currently executing tool name for UI
  isJudging: boolean;
  isComplete: boolean;
  startJudging: (prompt: string, responses: Record<string, string>) => void;
  reset: () => void;
}

/**
 * React hook for managing SSE connection to the Judge API
 * Streams scoring results and verdict from the Judge Agent
 */
export function useJudgeStream(): UseJudgeStreamReturn {
  const [scores, setScores] = useState<Record<string, ModelScores>>({});
  const [verdict, setVerdict] = useState<JudgeVerdict | null>(null);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [isJudging, setIsJudging] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

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

    setScores({});
    setVerdict(null);
    setCurrentTool(null);
    setIsJudging(false);
    setIsComplete(false);
  }, []);

  /**
   * Start judging with the given prompt and model responses
   */
  const startJudging = useCallback((prompt: string, responses: Record<string, string>) => {
    // Reset state before starting
    reset();

    // Create new abort controller
    abortController.current = new AbortController();
    const signal = abortController.current.signal;

    setIsJudging(true);

    // Start the SSE connection using fetch with ReadableStream
    const fetchJudge = async () => {
      try {
        const response = await fetch('/api/judge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, responses }),
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
                const event: JudgeStreamEvent = JSON.parse(data);
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

        console.error('Judge stream error:', error);
        setIsJudging(false);
        setIsComplete(false);
      }
    };

    /**
     * Process a single SSE event and update state accordingly
     */
    const processEvent = (event: JudgeStreamEvent) => {
      switch (event.type) {
        case 'tool_call': {
          const { tool } = event;
          setCurrentTool(tool);
          break;
        }

        case 'scoring': {
          const { model, category, score, rationale } = event;

          setScores((prev) => ({
            ...prev,
            [model]: {
              ...prev[model],
              [category]: {
                score,
                rationale,
              },
            },
          }));
          break;
        }

        case 'verdict': {
          const { winner, verdict: verdictText, highlight } = event;

          setVerdict({
            winner,
            verdict: verdictText,
            highlight,
          });
          break;
        }

        case 'complete': {
          const { scores: finalScores, verdict: finalVerdict } = event;

          // Update with final scores and verdict
          setScores(finalScores);
          setVerdict(finalVerdict);
          setCurrentTool(null);
          setIsJudging(false);
          setIsComplete(true);
          break;
        }
      }
    };

    // Start the fetch
    fetchJudge();
  }, [reset]);

  return {
    scores,
    verdict,
    currentTool,
    isJudging,
    isComplete,
    startJudging,
    reset,
  };
}

export default useJudgeStream;
