'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MODELS, type ModelKey } from '@/lib/models';
import Footer from '@/components/Footer';

interface GalleryDebate {
  id: string;
  prompt: string;
  verdict: { winner: string; verdict: string; highlight: string } | null;
  share_id: string;
  created_at: string;
  reaction_count: number;
}

function getModelDisplayInfo(winnerKey: string): { name: string } {
  const modelByKey = MODELS[winnerKey as ModelKey];
  if (modelByKey) return { name: modelByKey.name };
  const modelEntry = Object.entries(MODELS).find(([, config]) => config.name.toLowerCase() === winnerKey.toLowerCase());
  if (modelEntry) return { name: modelEntry[1].name };
  return { name: winnerKey };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
      if (!response.ok) throw new Error('Failed to fetch debates');
      const data = await response.json();
      if (page === 1) setDebates(data.debates);
      else setDebates(prev => [...prev, ...data.debates]);
      setHasMore(data.hasMore);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [page, sort]);

  useEffect(() => { fetchDebates(); }, [fetchDebates]);

  const handleSortChange = (newSort: 'recent' | 'popular') => { setSort(newSort); setPage(1); };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="h-16 border-b-2 border-gray-200 bg-white sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 border-2 border-black flex items-center justify-center">
              <span className="font-display text-xl tracking-wider">P</span>
            </div>
            <span className="font-display text-2xl tracking-widest hidden sm:block">PROMPTPIT</span>
          </Link>
          <Link href="/" className="btn-primary text-sm">START BATTLE</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <p className="text-xs font-mono tracking-widest text-gray-500 mb-2">{'// PUBLIC ARCHIVE'}</p>
            <h1 className="font-display text-4xl sm:text-5xl tracking-wider mb-2">BATTLE GALLERY</h1>
            <p className="text-sm text-gray-500 font-mono">{totalCount} BATTLES RECORDED</p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 mb-8">
            <span className="text-xs font-mono text-gray-400 hidden sm:inline">{'// SORT:'}</span>
            <button onClick={() => handleSortChange('recent')} className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-2 transition-all ${sort === 'recent' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'}`}>RECENT</button>
            <button onClick={() => handleSortChange('popular')} className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-2 transition-all ${sort === 'popular' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'}`}>POPULAR</button>
          </div>

          {/* Error */}
          {error && (
            <div className="border-2 border-gray-200 p-4 mb-6">
              <p className="text-sm text-gray-600 font-mono">{error}</p>
              <button onClick={fetchDebates} className="text-xs text-gray-500 hover:text-black underline mt-2 font-mono">TRY AGAIN</button>
            </div>
          )}

          {/* Loading */}
          {isLoading && debates.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border-2 border-gray-200">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-gray-50 p-5 animate-pulse" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="space-y-2 mb-4"><div className="h-4 bg-gray-200 w-full" /><div className="h-4 bg-gray-200 w-4/5" /></div>
                  <div className="flex items-center gap-2 mb-3"><div className="w-5 h-5 bg-gray-200" /><div className="h-4 bg-gray-200 w-20" /></div>
                  <div className="h-3 bg-gray-200 w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && debates.length === 0 && !error && (
            <div className="border-2 border-gray-200 p-12 text-center">
              <div className="w-16 h-16 border-2 border-gray-200 mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl text-gray-400">0</span>
              </div>
              <h2 className="font-display text-2xl tracking-wider mb-2">NO BATTLES YET</h2>
              <p className="text-sm text-gray-500 font-mono mb-6">BE THE FIRST TO SHARE A BATTLE</p>
              <Link href="/" className="btn-primary">START BATTLE</Link>
            </div>
          )}

          {/* Grid */}
          {debates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border-2 border-gray-200">
              {debates.map((debate) => {
                const winnerInfo = debate.verdict?.winner ? getModelDisplayInfo(debate.verdict.winner) : null;
                return (
                  <Link key={debate.id} href={`/share/${debate.share_id}`} className="bg-gray-50 p-5 hover:bg-gray-100 transition-colors group">
                    <p className="text-black font-mono text-sm line-clamp-3 mb-4 group-hover:text-black">{debate.prompt}</p>
                    {winnerInfo && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 bg-black" />
                        <span className="text-xs font-display tracking-wider text-black">{winnerInfo.name.toUpperCase()}</span>
                        <span className="text-xs text-gray-400 font-mono">WINNER</span>
                      </div>
                    )}
                    {debate.verdict?.highlight && <p className="text-xs text-gray-400 font-mono line-clamp-2 mb-4 italic">&quot;{debate.verdict.highlight}&quot;</p>}
                    <div className="flex items-center justify-between text-xs text-gray-400 font-mono pt-3 border-t border-gray-200">
                      <span>{formatDate(debate.created_at)}</span>
                      {debate.reaction_count > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 bg-black" />{debate.reaction_count}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-8">
              <button onClick={() => setPage(p => p + 1)} disabled={isLoading} className="btn-secondary disabled:opacity-30">
                {isLoading ? <><div className="w-4 h-4 border-2 border-gray-200 border-t-black animate-spin" />LOADING...</> : <>LOAD MORE<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>}
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
