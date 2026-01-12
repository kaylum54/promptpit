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
  placeholder = "What should the AIs debate today?",
  examples = DEFAULT_EXAMPLES,
  mode = 'debate'
}: DebateInputProps) {
  const [prompt, setPrompt] = useState('');
  const [wasLoading, setWasLoading] = useState(false);
  const [debateComplete, setDebateComplete] = useState(false);

  // Prompt optimizer state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [showOptimized, setShowOptimized] = useState(false);

  // Track when loading transitions from true to false (debate complete)
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

  // Prompt optimizer function
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

  // Use optimized prompt
  const handleUseOptimized = () => {
    setPrompt(optimizedPrompt);
    setShowOptimized(false);
    setOptimizedPrompt('');
  };

  // Dismiss optimization suggestion
  const handleDismissOptimized = () => {
    setShowOptimized(false);
    setOptimizedPrompt('');
  };

  // Get mode-specific colors
  const getModeColor = () => {
    switch (mode) {
      case 'code': return { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', light: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };
      case 'creative': return { bg: 'bg-violet-600', hover: 'hover:bg-violet-700', light: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400' };
      default: return { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', light: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' };
    }
  };

  const modeColor = getModeColor();

  return (
    <div className="max-w-input mx-auto mt-12 mb-10">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {/* Outer container with gradient background and glow effect */}
          <div
            className="relative p-1 rounded-2xl transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
              border: '1px solid var(--border-strong)',
            }}
          >
            {/* Outer glow effect */}
            <div
              className="absolute -inset-1 rounded-2xl opacity-50 blur-xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(0, 229, 255, 0.1) 100%)',
              }}
            />

            {/* Input container */}
            <div className="relative rounded-xl overflow-hidden" style={{ background: 'var(--bg-base)' }}>
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
                className="w-full bg-transparent text-text-primary placeholder-text-muted py-4 sm:py-5 px-4 sm:px-6 pr-24 sm:pr-48 text-base font-body outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-shadow duration-200 focus:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
                style={{ border: 'none' }}
              />

              {/* Button group inside input */}
              <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                {/* Optimize button - only show when not in debate mode, hidden on very small screens */}
                {!debateComplete && !isLoading && prompt.trim() && (
                  <button
                    type="button"
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                    title="Optimize prompt with AI"
                    className={`${modeColor.bg} ${modeColor.hover} text-white p-2 sm:p-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] hidden sm:flex items-center justify-center min-w-[44px] min-h-[44px]`}
                  >
                    {isOptimizing ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </button>
                )}

                {/* Submit/New button */}
                {debateComplete && onReset ? (
                  <button
                    type="button"
                    onClick={handleNewDebate}
                    className="bg-white text-[var(--bg-base)] font-semibold text-sm py-2.5 sm:py-3 px-4 sm:px-7 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] active:translate-y-0 flex items-center gap-1.5 sm:gap-2 min-h-[44px]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="hidden sm:inline">New</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || !prompt.trim()}
                    className="bg-white text-[var(--bg-base)] font-semibold text-sm py-2.5 sm:py-3 px-4 sm:px-7 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center gap-1.5 sm:gap-2 min-h-[44px]"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span className="hidden sm:inline">GO</span>
                      </>
                    ) : (
                      <>
                        <span>Start</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Optimized prompt suggestion */}
      {showOptimized && optimizedPrompt && (
        <div className={`mt-4 ${modeColor.light} border ${modeColor.border} rounded-lg p-4`}>
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-8 h-8 ${modeColor.bg} rounded-full flex items-center justify-center`}>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${modeColor.text} font-medium mb-1`}>Optimized prompt suggestion:</p>
              <p className="text-text-primary text-base">{optimizedPrompt}</p>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleUseOptimized}
                  className={`${modeColor.bg} ${modeColor.hover} text-white text-sm font-medium px-4 py-2 rounded-md transition-colors`}
                >
                  Use this
                </button>
                <button
                  type="button"
                  onClick={handleDismissOptimized}
                  className="bg-bg-elevated hover:bg-bg-subtle text-text-secondary text-sm font-medium px-4 py-2 rounded-md transition-colors border border-border"
                >
                  Keep original
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Example prompts */}
      <div className="mt-6">
        <p className="text-text-tertiary text-caption mb-3">Try an example:</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => handleExampleClick(example)}
              disabled={isLoading}
              className="text-body-small text-text-secondary bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-full px-4 py-2 hover:text-text-primary hover:border-[var(--border-strong)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
