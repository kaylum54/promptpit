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
          <div className="flex-1 overflow-y-auto p-6">
            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-text-tertiary text-sm">Loading leaderboard...</p>
              </div>
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
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-text-primary">{data.totalDebates}</p>
                    <p className="text-xs text-text-muted mt-1">Total Debates</p>
                  </div>
                  <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-accent-primary">{data.recentActivity.debatesLast24h}</p>
                    <p className="text-xs text-text-muted mt-1">Last 24 Hours</p>
                  </div>
                  <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-accent-secondary">{data.recentActivity.debatesLast7d}</p>
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
                      className="bg-bg-elevated border border-border-subtle rounded-xl p-4 hover:border-border transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="w-10 text-center">
                          {index < 3 ? (
                            <span className="text-2xl">{RANK_MEDALS[index]}</span>
                          ) : (
                            <span className="text-lg font-bold text-text-muted">#{index + 1}</span>
                          )}
                        </div>

                        {/* Model Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: model.color }}
                            />
                            <span className="font-semibold text-text-primary">{model.name}</span>
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
                        <div className="text-right">
                          <p className="font-bold text-text-primary">{model.wins} wins</p>
                          <p className="text-xs text-text-muted">
                            {model.winRate}% win rate • {model.totalDebates} debates
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
                  <div className="text-center py-12">
                    <span className="text-4xl mb-4 block">🏟️</span>
                    <p className="text-text-tertiary text-sm">No debates yet. Start debating to see rankings!</p>
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
