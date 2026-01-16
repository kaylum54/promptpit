'use client';

import { useState, useCallback, useRef } from 'react';
import type { ModelKey } from '@/lib/routing';
import type { IntentCategory } from '@/lib/intent-detection';

interface QuickRouting {
  model: ModelKey;
  modelName: string;
  reason: string;
  category: IntentCategory;
  confidence: number;
}

interface QuickModeState {
  routing: QuickRouting | null;
  response: string;
  responseId: string | null;
  isStreaming: boolean;
  error: string | null;
}

interface UseQuickModeReturn extends QuickModeState {
  startQuick: (prompt: string, overrideModel?: ModelKey) => void;
  reset: () => void;
}

export function useQuickMode(): UseQuickModeReturn {
  const [routing, setRouting] = useState<QuickRouting | null>(null);
  const [response, setResponse] = useState('');
  const [responseId, setResponseId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    // Abort any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setRouting(null);
    setResponse('');
    setResponseId(null);
    setIsStreaming(false);
    setError(null);
  }, []);

  const startQuick = useCallback(async (prompt: string, overrideModel?: ModelKey) => {
    // Reset state
    reset();

    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsStreaming(true);

    try {
      const res = await fetch('/api/quick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: overrideModel,
        }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to start quick mode');
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete events from buffer
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'routing') {
              setRouting({
                model: data.model,
                modelName: data.modelName,
                reason: data.reason,
                category: data.category,
                confidence: data.confidence,
              });
            } else if (data.type === 'content') {
              setResponse((prev) => prev + data.content);
            } else if (data.type === 'done') {
              setResponseId(data.responseId || null);
              setIsStreaming(false);
            } else if (data.type === 'error') {
              setError(data.error);
              setIsStreaming(false);
            }
          } catch (e) {
            console.error('Error parsing SSE event:', e);
          }
        }
      }

      setIsStreaming(false);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted, don't set error
        return;
      }

      console.error('Quick mode error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsStreaming(false);
    }
  }, [reset]);

  return {
    routing,
    response,
    responseId,
    isStreaming,
    error,
    startQuick,
    reset,
  };
}
