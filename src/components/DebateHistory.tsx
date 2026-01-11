'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Debate } from '@/lib/types';
import { MODELS, type ModelKey } from '@/lib/models';
import DebateReactions from './DebateReactions';
import ShareButton from './ShareButton';

interface DebateHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDebate?: (debate: Debate) => void;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return diffMinutes + ' minute' + (diffMinutes === 1 ? '' : 's') + ' ago';
  } else if (diffHours < 24) {
    return diffHours + ' hour' + (diffHours === 1 ? '' : 's') + ' ago';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return diffDays + ' days ago';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

// truncateText function removed - not currently used

function getModelDisplayInfo(winnerKey: string): { name: string; color: string } {
  const colorMap: Record<string, string> = {
    'Claude': '#f59e0b',
    'GPT-4o': '#10b981',
    'Gemini': '#8b5cf6',
    'Llama': '#06b6d4',
  };

  const modelByKey = MODELS[winnerKey as ModelKey];
  if (modelByKey) {
    return { name: modelByKey.name, color: colorMap[modelByKey.name] || '#3b82f6' };
  }

  const modelEntry = Object.entries(MODELS).find(
    ([, config]) => config.name.toLowerCase() === winnerKey.toLowerCase()
  );
  if (modelEntry) {
    return { name: modelEntry[1].name, color: colorMap[modelEntry[1].name] || '#3b82f6' };
  }

  return { name: winnerKey, color: '#71717a' };
}

export default function DebateHistory({
  isOpen,
  onClose,
  onSelectDebate,
  isAuthenticated = false,
  onAuthRequired,
}: DebateHistoryProps) {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDebates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/debates');
      if (!response.ok) {
        throw new Error('Failed to fetch debates');
      }
      const data = await response.json();
      setDebates(data.debates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchDebates();
    }
  }, [isOpen, fetchDebates]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSelectDebate = (debate: Debate) => {
    if (onSelectDebate) {
      onSelectDebate(debate);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={handleBackdropClick}
      />

      {/* Slide-in Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-bg-surface border-l border-border z-50 slide-in-right overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-surface sticky top-0">
          <h2 className="text-xl font-bold text-text-primary">History</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-bg-elevated transition-colors text-text-tertiary hover:text-text-secondary"
            aria-label="Close history panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-text-tertiary text-sm">Loading debates...</p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="p-4">
              <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-center">
                <p className="text-error text-sm mb-2">{error}</p>
                <button onClick={fetchDebates} className="text-xs text-error/80 hover:text-error underline">
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && debates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <span className="text-4xl mb-4">&#x1F3DF;</span>
              <p className="text-text-tertiary text-sm mb-2">No debates yet.</p>
              <p className="text-text-muted text-xs">Start debating!</p>
            </div>
          )}

          {/* Debate List */}
          {!isLoading && !error && debates.length > 0 && (
            <ul className="divide-y divide-border-subtle">
              {debates.map((debate) => {
                const winnerInfo = debate.verdict?.winner
                  ? getModelDisplayInfo(debate.verdict.winner)
                  : null;

                return (
                  <li key={debate.id} className="px-6 py-4 hover:bg-bg-elevated transition-colors">
                    <button
                      onClick={() => handleSelectDebate(debate)}
                      className="w-full text-left"
                    >
                      <p className="text-[15px] font-medium text-text-primary line-clamp-2 mb-2">
                        {debate.prompt}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        {winnerInfo && (
                          <span className="inline-flex items-center text-caption" style={{ color: winnerInfo.color }}>
                            <span className="mr-1">&#x1F3C6;</span>
                            {winnerInfo.name}
                          </span>
                        )}
                        <span className="text-text-muted">&#x00B7;</span>
                        <span className="text-mono-small text-text-tertiary">
                          {formatRelativeTime(debate.created_at)}
                        </span>
                      </div>
                    </button>
                    {/* Actions */}
                    <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <DebateReactions
                        debateId={debate.id}
                        isAuthenticated={isAuthenticated}
                        onAuthRequired={onAuthRequired}
                      />
                      <ShareButton
                        debateId={debate.id}
                        initialShareId={debate.share_id}
                        isPublic={debate.is_public}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
