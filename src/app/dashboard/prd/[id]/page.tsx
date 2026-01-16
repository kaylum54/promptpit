'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PRDBuilder } from '@/components/dashboard/PRDBuilder';
import type { PRD, PRDDebate, PRDMessage, PRDMessageStreamEvent } from '@/lib/types';

export default function PRDBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [prd, setPrd] = useState<PRD | null>(null);
  const [messages, setMessages] = useState<PRDMessage[]>([]);
  const [debates, setDebates] = useState<PRDDebate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch PRD data
  const fetchPRD = useCallback(async () => {
    try {
      const response = await fetch(`/api/prd/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/dashboard/prd');
          return;
        }
        throw new Error('Failed to fetch PRD');
      }
      const data = await response.json();
      setPrd(data.prd);
      setMessages(data.messages || []);
      setDebates(data.debates || []);

      // Redirect if completed
      if (data.prd.status === 'completed') {
        router.push(`/dashboard/prd/${id}/output`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchPRD();
  }, [fetchPRD]);

  // Send message handler
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isStreaming || !prd) return;

    setIsStreaming(true);
    setStreamingContent('');
    setError(null);

    // Add user message optimistically
    const tempUserMsg: PRDMessage = {
      id: `temp-${Date.now()}`,
      prd_id: id,
      user_id: '',
      role: 'user',
      content: content,
      phase: prd.current_phase,
      message_type: 'chat',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await fetch(`/api/prd/${id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const event: PRDMessageStreamEvent = JSON.parse(data);

              if (event.type === 'chunk' && event.content) {
                accumulatedContent += event.content;
                setStreamingContent(accumulatedContent);
              } else if (event.type === 'complete') {
                // Add assistant message
                const assistantMsg: PRDMessage = {
                  id: event.message_id || `msg-${Date.now()}`,
                  prd_id: id,
                  user_id: '',
                  role: 'assistant',
                  content: accumulatedContent,
                  phase: prd.current_phase,
                  message_type: 'chat',
                  created_at: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, assistantMsg]);
                setStreamingContent('');
              } else if (event.type === 'debate_trigger') {
                // Handle debate trigger - refetch to get the new debate
                await fetchPRD();
              } else if (event.type === 'phase_complete') {
                // Update PRD phase
                if (event.phase) {
                  setPrd((prev) => prev ? { ...prev, current_phase: event.phase! } : prev);
                }
              } else if (event.type === 'error') {
                throw new Error(event.error || 'Unknown error');
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setIsStreaming(false);
    }
  };

  // Handle phase navigation
  const handlePhaseAction = async (action: 'next' | 'back') => {
    if (!prd) return;

    try {
      const response = await fetch(`/api/prd/${id}/phase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error('Failed to change phase');

      const data = await response.json();
      setPrd(data.prd);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading your PRD...</p>
        </div>
      </div>
    );
  }

  if (!prd) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📄</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">PRD not found</h2>
          <p className="text-gray-500">This PRD may have been deleted or you don&apos;t have access.</p>
        </div>
      </div>
    );
  }

  return (
    <PRDBuilder
      prd={prd}
      initialMessages={messages}
      initialDebates={debates}
      onSendMessage={handleSendMessage}
      onPhaseAction={handlePhaseAction}
      isStreaming={isStreaming}
      streamingContent={streamingContent}
      error={error}
    />
  );
}
