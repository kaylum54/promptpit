'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MODELS, type ModelKey } from '@/lib/models';

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

  useEffect(() => {
    fetchDebates();
  }, [sort, page]);

  const fetchDebates = async () => {
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
  };

  const handleSortChange = (newSort: 'recent' | 'popular') => {
    setSort(newSort);
    setPage(1);
  };

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
            Start a Debate
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Public Debate Gallery</h1>
            <p className="text-text-secondary">
              Browse debates shared by the community ({totalCount} total)
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-text-muted">Sort by:</span>
            <button
              onClick={() => handleSortChange('recent')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                sort === 'recent'
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              Most Recent
            </button>
            <button
              onClick={() => handleSortChange('popular')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                sort === 'popular'
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              Most Popular
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

          {/* Loading */}
          {isLoading && debates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-text-tertiary">Loading debates...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && debates.length === 0 && !error && (
            <div className="text-center py-20">
              <span className="text-6xl mb-6 block">&#x1F3DF;</span>
              <h2 className="text-xl font-bold text-text-primary mb-2">No Shared Debates Yet</h2>
              <p className="text-text-secondary mb-6">
                Be the first to share a debate with the community!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-accent-primary text-white px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors"
              >
                Start a Debate
              </Link>
            </div>
          )}

          {/* Debate Grid */}
          {debates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {debates.map((debate) => {
                const winnerInfo = debate.verdict?.winner
                  ? getModelDisplayInfo(debate.verdict.winner)
                  : null;

                return (
                  <Link
                    key={debate.id}
                    href={`/share/${debate.share_id}`}
                    className="bg-bg-elevated border border-border-subtle rounded-xl p-5 hover:border-accent-primary/50 transition-all hover:shadow-lg group"
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
            <div className="text-center mt-8">
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={isLoading}
                className="px-6 py-3 bg-bg-elevated border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary hover:border-accent-primary/50 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle px-6 py-4">
        <div className="max-w-content mx-auto text-center text-text-muted text-sm">
          <Link href="/" className="hover:text-accent-primary transition-colors">
            Create your own AI debate on PromptPit
          </Link>
        </div>
      </footer>
    </div>
  );
}
