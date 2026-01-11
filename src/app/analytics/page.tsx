'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import type { ModelKey } from '@/lib/models';

interface ModelWinStats {
  name: string;
  key: ModelKey;
  color: string;
  wins: number;
  winRate: number;
}

interface TimeSeriesPoint {
  date: string;
  count: number;
}

interface AnalyticsData {
  overview: {
    totalDebates: number;
    debatesThisMonth: number;
    debatesThisWeek: number;
    totalReactionsReceived: number;
    sharedDebates: number;
  };
  modelWins: ModelWinStats[];
  favoriteModel: string | null;
  debatesOverTime: TimeSeriesPoint[];
  reactionBreakdown: {
    like: number;
    fire: number;
    think: number;
    laugh: number;
  };
}

const REACTION_EMOJIS = {
  like: '👍',
  fire: '🔥',
  think: '🤔',
  laugh: '😂',
};

export default function AnalyticsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="w-10 h-10 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-base">
        <header className="h-16 border-b border-border-subtle bg-bg-base/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <span className="text-xl">&#x1F3DF;</span>
              <h1 className="text-xl font-bold text-text-primary">PromptPit</h1>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <span className="text-6xl mb-6 block">&#x1F4CA;</span>
            <h1 className="text-2xl font-bold text-text-primary mb-3">Sign In to View Analytics</h1>
            <p className="text-text-secondary mb-6">
              Track your debate history, see win rates, and discover which AI models perform best for you.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-accent-primary text-white px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors"
            >
              Go to Home & Sign In
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {/* Header */}
      <header className="h-16 border-b border-border-subtle bg-bg-base/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-xl">&#x1F3DF;</span>
            <h1 className="text-xl font-bold text-text-primary">PromptPit</h1>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-accent-primary hover:text-accent-hover px-4 py-2 rounded-md hover:bg-bg-elevated transition-colors"
          >
            Back to Debates
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Your Analytics</h1>
            <p className="text-text-secondary">
              Track your debate activity and see how different models perform
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-text-tertiary">Loading analytics...</p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
              <p className="text-error text-sm">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="text-xs text-error/80 hover:text-error underline mt-2"
              >
                Try again
              </button>
            </div>
          )}

          {/* Analytics Content */}
          {data && !isLoading && (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-bg-elevated border border-border-subtle rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-text-primary">{data.overview.totalDebates}</p>
                  <p className="text-xs text-text-muted mt-1">Total Debates</p>
                </div>
                <div className="bg-bg-elevated border border-border-subtle rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-accent-primary">{data.overview.debatesThisMonth}</p>
                  <p className="text-xs text-text-muted mt-1">This Month</p>
                </div>
                <div className="bg-bg-elevated border border-border-subtle rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-accent-secondary">{data.overview.debatesThisWeek}</p>
                  <p className="text-xs text-text-muted mt-1">This Week</p>
                </div>
                <div className="bg-bg-elevated border border-border-subtle rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-success">{data.overview.sharedDebates}</p>
                  <p className="text-xs text-text-muted mt-1">Shared</p>
                </div>
                <div className="bg-bg-elevated border border-border-subtle rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-warning">{data.overview.totalReactionsReceived}</p>
                  <p className="text-xs text-text-muted mt-1">Reactions</p>
                </div>
              </div>

              {/* Two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Model Win Rates */}
                <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">Model Win Rates</h2>
                  {data.favoriteModel && (
                    <p className="text-sm text-text-muted mb-4">
                      Your debates favor <span className="text-accent-primary font-medium">{data.favoriteModel}</span>
                    </p>
                  )}
                  <div className="space-y-4">
                    {data.modelWins.map((model) => (
                      <div key={model.key}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: model.color }}
                            />
                            <span className="text-text-primary font-medium">{model.name}</span>
                          </div>
                          <span className="text-text-secondary text-sm">
                            {model.wins} wins ({model.winRate}%)
                          </span>
                        </div>
                        <div className="h-2 bg-bg-base rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${model.winRate}%`,
                              backgroundColor: model.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {data.overview.totalDebates === 0 && (
                    <p className="text-text-muted text-sm text-center py-8">
                      Complete some debates to see win rates!
                    </p>
                  )}
                </div>

                {/* Reaction Breakdown */}
                <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">Reactions Received</h2>
                  {data.overview.totalReactionsReceived > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {(Object.entries(data.reactionBreakdown) as [keyof typeof REACTION_EMOJIS, number][]).map(
                        ([type, count]) => (
                          <div
                            key={type}
                            className="bg-bg-base rounded-lg p-4 text-center"
                          >
                            <span className="text-3xl">{REACTION_EMOJIS[type]}</span>
                            <p className="text-2xl font-bold text-text-primary mt-2">{count}</p>
                            <p className="text-xs text-text-muted capitalize">{type}</p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <span className="text-4xl mb-4 block">&#x1F4AC;</span>
                      <p className="text-text-muted text-sm">
                        Share your debates to start receiving reactions!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Chart */}
              <div className="mt-8 bg-bg-elevated border border-border-subtle rounded-xl p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Activity (Last 30 Days)</h2>
                {(() => {
                  const maxCount = Math.max(...data.debatesOverTime.map(p => p.count), 1);
                  const totalActivity = data.debatesOverTime.reduce((sum, p) => sum + p.count, 0);

                  return (
                    <>
                      <div className="h-40 flex items-end gap-1">
                        {data.debatesOverTime.map((point) => {
                          const heightPercent = (point.count / maxCount) * 100;
                          const hasActivity = point.count > 0;

                          return (
                            <div
                              key={point.date}
                              className="flex-1 group relative flex flex-col justify-end"
                              style={{ minHeight: '100%' }}
                            >
                              {/* Bar */}
                              <div
                                className={`w-full rounded-sm transition-all ${
                                  hasActivity
                                    ? 'bg-blue-500 hover:bg-blue-400'
                                    : 'bg-zinc-800 hover:bg-zinc-700'
                                }`}
                                style={{
                                  height: hasActivity ? `${Math.max(heightPercent, 15)}%` : '3px',
                                  minHeight: hasActivity ? '20px' : '3px'
                                }}
                              />
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                                {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {point.count} debate{point.count !== 1 ? 's' : ''}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-3 text-xs text-text-muted">
                        <span>30 days ago</span>
                        <span className="text-text-secondary font-medium">{totalActivity} debates total</span>
                        <span>Today</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Empty State */}
              {data.overview.totalDebates === 0 && (
                <div className="mt-8 text-center py-12 bg-bg-elevated border border-border-subtle rounded-xl">
                  <span className="text-6xl mb-4 block">&#x1F3DF;</span>
                  <h2 className="text-xl font-bold text-text-primary mb-2">No Debates Yet</h2>
                  <p className="text-text-secondary mb-6">
                    Start debating to see your analytics!
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-accent-primary text-white px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    Start Your First Debate
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle px-6 py-4">
        <div className="max-w-content mx-auto text-center text-text-muted text-sm">
          Powered by OpenRouter
        </div>
      </footer>
    </div>
  );
}
