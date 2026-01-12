'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MODELS, type ModelKey } from '@/lib/models';

interface RecentDebate {
  id: string;
  prompt: string;
  arena: 'debate' | 'code' | 'writing';
  winner: string | null;
  created_at: string;
  share_id: string;
}

interface RecentBattlesProps {
  className?: string;
}

const ARENA_ICONS: Record<'debate' | 'code' | 'writing', string> = {
  debate: '\u2696\uFE0F', // Balance scale
  code: '\uD83D\uDCBB',   // Laptop
  writing: '\u270D\uFE0F', // Writing hand
};

const ARENA_NAMES: Record<'debate' | 'code' | 'writing', string> = {
  debate: 'Debate',
  code: 'Code',
  writing: 'Writing',
};

/**
 * Format a date string as relative time (e.g., "2 hours ago", "Yesterday")
 */
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

/**
 * Get model display name from winner key
 */
function getModelDisplayName(winnerKey: string | null): string {
  if (!winnerKey) return 'Unknown';

  // Check if it's a direct model key
  const modelByKey = MODELS[winnerKey as ModelKey];
  if (modelByKey) {
    return modelByKey.name;
  }

  // Check if it matches a model name (case-insensitive)
  const modelEntry = Object.entries(MODELS).find(
    ([, config]) => config.name.toLowerCase() === winnerKey.toLowerCase()
  );
  if (modelEntry) {
    return modelEntry[1].name;
  }

  // Return the key as-is if no match found
  return winnerKey;
}

/**
 * Truncate text with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export default function RecentBattles({ className = '' }: RecentBattlesProps) {
  const [debates, setDebates] = useState<RecentDebate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentDebates = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/debates/recent?limit=5');
        if (!response.ok) {
          throw new Error('Failed to fetch recent battles');
        }
        const data = await response.json();
        setDebates(data.debates || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentDebates();
  }, []);

  return (
    <div className={`w-full max-w-[800px] mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <span className="text-xl">{'\uD83C\uDFC6'}</span>
          RECENT BATTLES
        </h2>
        <Link
          href="/gallery"
          className="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
        >
          View All
          <span>{'\u2192'}</span>
        </Link>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="bg-bg-surface border border-border rounded-lg p-4 animate-pulse"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              {/* Prompt skeleton */}
              <div className="space-y-2 mb-3">
                <div className="h-4 bg-bg-elevated rounded w-full" />
                <div className="h-4 bg-bg-elevated rounded w-3/4" />
              </div>
              {/* Meta skeleton */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-bg-elevated rounded" />
                <div className="h-3 bg-bg-elevated rounded w-16" />
                <div className="w-1 h-1 bg-bg-elevated rounded-full" />
                <div className="h-3 bg-bg-elevated rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-center">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && debates.length === 0 && (
        <div className="bg-bg-surface border border-border rounded-lg p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">{'\u2694\uFE0F'}</span>
          </div>
          <h3 className="text-text-primary font-semibold mb-1">No battles yet</h3>
          <p className="text-text-secondary text-sm">
            Be the first to start an AI battle!
          </p>
        </div>
      )}

      {/* Battle List */}
      {!isLoading && !error && debates.length > 0 && (
        <div className="space-y-3">
          {debates.map((debate) => (
            <Link
              key={debate.id}
              href={`/share/${debate.share_id}`}
              className="block bg-bg-surface border border-border rounded-lg p-4 hover:bg-bg-elevated hover:border-border-strong transition-all duration-200"
            >
              {/* Prompt */}
              <p className="text-[15px] text-text-primary mb-3 leading-relaxed">
                {truncateText(debate.prompt, 120)}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-3 text-sm">
                {/* Arena Icon */}
                <span
                  className="flex items-center gap-1.5 text-text-secondary"
                  title={`${ARENA_NAMES[debate.arena]} Arena`}
                >
                  <span>{ARENA_ICONS[debate.arena]}</span>
                  <span className="text-xs text-text-tertiary">{ARENA_NAMES[debate.arena]}</span>
                </span>

                <span className="text-text-muted">{'\u00B7'}</span>

                {/* Winner */}
                {debate.winner && (
                  <>
                    <span className="flex items-center gap-1.5 text-text-secondary">
                      <span className="text-xs">{'\uD83C\uDFC6'}</span>
                      <span className="text-xs font-medium">{getModelDisplayName(debate.winner)}</span>
                    </span>
                    <span className="text-text-muted">{'\u00B7'}</span>
                  </>
                )}

                {/* Time */}
                <span className="text-xs text-text-tertiary">
                  {formatRelativeTime(debate.created_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
