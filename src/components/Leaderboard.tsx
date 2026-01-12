'use client';

import { useState, useEffect } from 'react';
import type { ModelKey } from '@/lib/models';

interface ModelStats {
  name: string;
  key: ModelKey;
  color: string;
  wins: number;
  totalDebates: number;
  winRate: number;
  avgScore: number;
}

interface LeaderboardData {
  modelStats: ModelStats[];
  totalDebates: number;
  recentActivity: {
    debatesLast24h: number;
    debatesLast7d: number;
  };
}

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ isOpen, onClose }: LeaderboardProps) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
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

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <h2 className="text-xl font-bold text-text-primary">Model Leaderboard</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-bg-elevated transition-colors text-text-tertiary hover:text-text-secondary"
              aria-label="Close leaderboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Loading Skeleton */}
            {isLoading && (
              <>
                {/* Stats Summary Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-bg-elevated border border-border-subtle rounded-xl p-3 sm:p-4 text-center animate-pulse"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="h-6 sm:h-8 bg-bg-subtle rounded w-16 mx-auto mb-2" />
                      <div className="h-3 bg-bg-subtle rounded w-20 mx-auto" />
                    </div>
                  ))}
                </div>

                {/* Rankings Header Skeleton */}
                <div className="h-4 bg-bg-elevated rounded w-32 mb-4 animate-pulse" />

                {/* Model Rankings Skeleton */}
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-bg-elevated border border-border-subtle rounded-xl p-4 animate-pulse"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank skeleton */}
                        <div className="w-10 h-8 bg-bg-subtle rounded" />

                        {/* Model info skeleton */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-bg-subtle rounded-full" />
                            <div className="h-4 bg-bg-subtle rounded w-24" />
                          </div>
                          <div className="h-2 bg-bg-subtle rounded-full w-full" />
                        </div>

                        {/* Stats skeleton */}
                        <div className="text-right">
                          <div className="h-4 bg-bg-subtle rounded w-16 mb-1" />
                          <div className="h-3 bg-bg-subtle rounded w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-center">
                <p className="text-error text-sm mb-2">{error}</p>
                <button onClick={fetchLeaderboard} className="text-xs text-error/80 hover:text-error underline">
                  Try again
                </button>
              </div>
            )}

            {/* Data */}
            {data && !isLoading && (
              <>
                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="bg-bg-elevated border border-border-subtle rounded-xl p-3 sm:p-4 text-center">
                    <p className="text-xl sm:text-2xl font-bold text-text-primary">{data.totalDebates}</p>
                    <p className="text-xs text-text-muted mt-1">Total Debates</p>
                  </div>
                  <div className="bg-bg-elevated border border-border-subtle rounded-xl p-3 sm:p-4 text-center">
                    <p className="text-xl sm:text-2xl font-bold text-accent-primary">{data.recentActivity.debatesLast24h}</p>
                    <p className="text-xs text-text-muted mt-1">Last 24 Hours</p>
                  </div>
                  <div className="bg-bg-elevated border border-border-subtle rounded-xl p-3 sm:p-4 text-center">
                    <p className="text-xl sm:text-2xl font-bold text-accent-secondary">{data.recentActivity.debatesLast7d}</p>
                    <p className="text-xs text-text-muted mt-1">Last 7 Days</p>
                  </div>
                </div>

                {/* Model Rankings */}
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                  Rankings by Wins
                </h3>
                <div className="space-y-3">
                  {data.modelStats.map((model, index) => (
                    <div
                      key={model.key}
                      className="bg-bg-elevated border border-border-subtle rounded-xl p-3 sm:p-4 hover:border-border transition-colors"
                    >
                      <div className="flex items-center gap-2 sm:gap-4">
                        {/* Rank */}
                        <div className="w-8 sm:w-10 text-center flex-shrink-0">
                          {index < 3 ? (
                            <span className="text-xl sm:text-2xl">{RANK_MEDALS[index]}</span>
                          ) : (
                            <span className="text-base sm:text-lg font-bold text-text-muted">#{index + 1}</span>
                          )}
                        </div>

                        {/* Model Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: model.color }}
                            />
                            <span className="font-semibold text-text-primary text-sm sm:text-base truncate">{model.name}</span>
                          </div>

                          {/* Progress bar for win rate */}
                          <div className="h-2 bg-bg-base rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(model.winRate, 100)}%`,
                                backgroundColor: model.color,
                              }}
                            />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-text-primary text-sm sm:text-base">{model.wins} wins</p>
                          <p className="text-[10px] sm:text-xs text-text-muted">
                            <span className="hidden sm:inline">{model.winRate}% win rate • </span>{model.totalDebates} debates
                          </p>
                        </div>
                      </div>

                      {/* Average Score */}
                      {model.avgScore > 0 && (
                        <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-sm">
                          <span className="text-text-muted">Average Score</span>
                          <span className="font-medium text-text-secondary">{model.avgScore}/10</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {data.totalDebates === 0 && (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-6">
                    <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h3 className="text-text-primary font-semibold mb-2">No rankings yet</h3>
                    <p className="text-text-secondary text-sm mb-6 max-w-[280px]">
                      Start debating to see which AI model performs best. Rankings update in real-time!
                    </p>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
                    >
                      Start Your First Debate
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
