'use client';

import { useState, useEffect } from 'react';
import type { ArenaMode } from '@/lib/modes';

interface DebateInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  onReset?: () => void;
  placeholder?: string;
  examples?: string[];
  mode?: ArenaMode;
}

const DEFAULT_EXAMPLES = [
  "Is AI a threat to humanity?",
  "Should social media be regulated?",
  "Is remote work better than office work?",
];

export default function DebateInput({
  onSubmit,
  isLoading,
  onReset,
  placeholder = "ENTER YOUR PROMPT...",
  examples = DEFAULT_EXAMPLES,
  mode = 'debate'
}: DebateInputProps) {
  const [prompt, setPrompt] = useState('');
  const [wasLoading, setWasLoading] = useState(false);
  const [debateComplete, setDebateComplete] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [showOptimized, setShowOptimized] = useState(false);

  useEffect(() => {
    if (wasLoading && !isLoading && prompt.trim()) {
      setDebateComplete(true);
    }
    setWasLoading(isLoading);
  }, [isLoading, wasLoading, prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      setDebateComplete(false);
      setShowOptimized(false);
      setOptimizedPrompt('');
      onSubmit(prompt.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    if (!isLoading) {
      setPrompt(example);
      setShowOptimized(false);
      setOptimizedPrompt('');
    }
  };

  const handleNewDebate = () => {
    setPrompt('');
    setDebateComplete(false);
    setShowOptimized(false);
    setOptimizedPrompt('');
    onReset?.();
  };

  const handleOptimize = async () => {
    if (!prompt.trim() || isOptimizing || isLoading) return;
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), mode }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.optimized && data.optimized !== prompt.trim()) {
          setOptimizedPrompt(data.optimized);
          setShowOptimized(true);
        }
      }
    } catch (error) {
      console.error('Failed to optimize prompt:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleUseOptimized = () => {
    setPrompt(optimizedPrompt);
    setShowOptimized(false);
    setOptimizedPrompt('');
  };

  const handleDismissOptimized = () => {
    setShowOptimized(false);
    setOptimizedPrompt('');
  };

  return (
    <div className="max-w-[720px] mx-auto mt-12 mb-10">
      <form onSubmit={handleSubmit}>
        <div className="border-2 border-black bg-white">
          <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <span className="text-xs font-mono tracking-wider text-gray-500">{'// INPUT'}</span>
            {isLoading && <span className="text-xs font-mono tracking-wider text-black animate-pulse">PROCESSING...</span>}
          </div>
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (showOptimized) {
                  setShowOptimized(false);
                  setOptimizedPrompt('');
                }
              }}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full bg-transparent text-black placeholder-gray-400 py-5 px-4 pr-40 text-base font-mono outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {!debateComplete && !isLoading && prompt.trim() && (
                <button type="button" onClick={handleOptimize} disabled={isOptimizing} title="Optimize prompt" className="p-2 border border-gray-200 text-gray-500 hover:text-black hover:border-black transition-colors disabled:opacity-30">
                  {isOptimizing ? <div className="w-4 h-4 border-2 border-gray-200 border-t-black animate-spin" /> : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                </button>
              )}
              {debateComplete && onReset ? (
                <button type="button" onClick={handleNewDebate} className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-mono uppercase tracking-wider hover:bg-gray-900 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  <span className="hidden sm:inline">NEW</span>
                </button>
              ) : (
                <button type="submit" disabled={isLoading || !prompt.trim()} className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-mono uppercase tracking-wider hover:bg-gray-900 transition-colors disabled:opacity-30">
                  {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" /> : <><span>FIGHT</span><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {showOptimized && optimizedPrompt && (
        <div className="mt-4 border-2 border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 border-2 border-black flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono tracking-wider text-gray-500 mb-2">{'// OPTIMIZED PROMPT'}</p>
              <p className="text-black text-sm font-mono">{optimizedPrompt}</p>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={handleUseOptimized} className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-mono uppercase tracking-wider hover:bg-gray-900 transition-colors text-sm py-2">USE THIS</button>
                <button type="button" onClick={handleDismissOptimized} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-mono uppercase tracking-wider hover:border-black hover:text-black transition-colors text-sm py-2">KEEP ORIGINAL</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <p className="text-xs font-mono tracking-wider text-gray-400 mb-3">{'// TRY AN EXAMPLE:'}</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((example) => (
            <button key={example} type="button" onClick={() => handleExampleClick(example)} disabled={isLoading} className="text-xs font-mono text-gray-500 border border-gray-200 px-3 py-2 hover:text-black hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
