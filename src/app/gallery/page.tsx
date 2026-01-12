'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MODELS, type ModelKey } from '@/lib/models';
import Footer from '@/components/Footer';

interface GalleryDebate {
  id: string;
  prompt: string;
  verdict: {
    winner: string;
    verdict: string;
    highlight: string;
  } | null;
  share_id: string;
  created_at: string;
  reaction_count: number;
}

function getModelDisplayInfo(winnerKey: string): { name: string; color: string } {
  const colorMap: Record<string, string> = {
    'Claude': '#f59e0b',
    'GPT-4o': '#10b981',
    'Gemini': '#8b5cf6',
    'Llama': '#06b6d4',
  };

  // Check if it's a model key
  const modelByKey = MODELS[winnerKey as ModelKey];
  if (modelByKey) {
    return { name: modelByKey.name, color: colorMap[modelByKey.name] || '#3b82f6' };
  }

  // Check by model name
  const modelEntry = Object.entries(MODELS).find(
    ([, config]) => config.name.toLowerCase() === winnerKey.toLowerCase()
  );
  if (modelEntry) {
    return { name: modelEntry[1].name, color: colorMap[modelEntry[1].name] || '#3b82f6' };
  }

  return { name: winnerKey, color: '#71717a' };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function GalleryPage() {
  const [debates, setDebates] = useState<GalleryDebate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDebates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/gallery?page=${page}&sort=${sort}&limit=12`);
      if (!response.ok) {
        throw new Error('Failed to fetch debates');
      }
      const data = await response.json();

      if (page === 1) {
        setDebates(data.debates);
      } else {
        setDebates(prev => [...prev, ...data.debates]);
      }
      setHasMore(data.hasMore);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [page, sort]);

  useEffect(() => {
    fetchDebates();
  }, [fetchDebates]);

  const handleSortChange = (newSort: 'recent' | 'popular') => {
    setSort(newSort);
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {/* Header */}
      <header className="h-16 border-b border-border-subtle bg-bg-base/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
            <span className="text-xl">&#x1F3DF;</span>
            <h1 className="text-lg sm:text-xl font-bold text-text-primary">PromptPit</h1>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-accent-primary hover:text-accent-hover px-3 sm:px-4 py-2 rounded-md hover:bg-bg-elevated transition-colors min-h-[44px] flex items-center"
          >
            <span className="hidden sm:inline">Start a Debate</span>
            <span className="sm:hidden">Start</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Public Debate Gallery</h1>
            <p className="text-sm sm:text-base text-text-secondary">
              Browse debates shared by the community ({totalCount} total)
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-text-muted hidden sm:inline">Sort by:</span>
            <button
              onClick={() => handleSortChange('recent')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-sm transition-colors min-h-[44px] ${
                sort === 'recent'
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => handleSortChange('popular')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-sm transition-colors min-h-[44px] ${
                sort === 'popular'
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              Popular
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
              <p className="text-error text-sm">{error}</p>
              <button
                onClick={fetchDebates}
                className="text-xs text-error/80 hover:text-error underline mt-2"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && debates.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-bg-elevated border border-border-subtle rounded-xl p-5 animate-pulse"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Prompt skeleton */}
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-bg-subtle rounded w-full" />
                    <div className="h-4 bg-bg-subtle rounded w-4/5" />
                    <div className="h-4 bg-bg-subtle rounded w-3/5" />
                  </div>

                  {/* Winner skeleton */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-bg-subtle rounded" />
                    <div className="h-4 bg-bg-subtle rounded w-20" />
                  </div>

                  {/* Highlight skeleton */}
                  <div className="space-y-1 mb-4">
                    <div className="h-3 bg-bg-subtle rounded w-full" />
                    <div className="h-3 bg-bg-subtle rounded w-2/3" />
                  </div>

                  {/* Footer skeleton */}
                  <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                    <div className="h-3 bg-bg-subtle rounded w-20" />
                    <div className="h-3 bg-bg-subtle rounded w-8" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && debates.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center text-center py-20 px-6">
              <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">No Shared Debates Yet</h2>
              <p className="text-text-secondary mb-6 max-w-md">
                Be the first to share a debate with the community! Start a debate, then share it to see it appear here.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-accent-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-hover transition-colors"
              >
                Start a Debate
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}

          {/* Debate Grid */}
          {debates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {debates.map((debate) => {
                const winnerInfo = debate.verdict?.winner
                  ? getModelDisplayInfo(debate.verdict.winner)
                  : null;

                return (
                  <Link
                    key={debate.id}
                    href={`/share/${debate.share_id}`}
                    className="bg-bg-elevated border border-border-subtle rounded-xl p-4 sm:p-5 hover:border-accent-primary/50 transition-all hover:shadow-lg group"
                  >
                    {/* Prompt */}
                    <p className="text-text-primary font-medium line-clamp-3 mb-4 group-hover:text-accent-primary transition-colors">
                      {debate.prompt}
                    </p>

                    {/* Winner */}
                    {winnerInfo && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">&#x1F3C6;</span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: winnerInfo.color }}
                        >
                          {winnerInfo.name}
                        </span>
                      </div>
                    )}

                    {/* Highlight */}
                    {debate.verdict?.highlight && (
                      <p className="text-sm text-text-secondary line-clamp-2 mb-4 italic">
                        &ldquo;{debate.verdict.highlight}&rdquo;
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-border-subtle">
                      <span>{formatDate(debate.created_at)}</span>
                      {debate.reaction_count > 0 && (
                        <span className="flex items-center gap-1">
                          <span>&#x2764;</span>
                          {debate.reaction_count}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-6 sm:mt-8">
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={isLoading}
                className="px-6 py-3 bg-bg-elevated border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary hover:border-accent-primary/50 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span>Load More</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
