'use client';

import { useState, useEffect } from 'react';

interface DebateInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  onReset?: () => void;
}

const EXAMPLE_PROMPTS = [
  "Is AI a threat to humanity?",
  "Should social media be regulated?",
  "Is remote work better than office work?",
];

export default function DebateInput({ onSubmit, isLoading, onReset }: DebateInputProps) {
  const [prompt, setPrompt] = useState('');
  const [wasLoading, setWasLoading] = useState(false);
  const [debateComplete, setDebateComplete] = useState(false);

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
      onSubmit(prompt.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    if (!isLoading) {
      setPrompt(example);
    }
  };

  const handleNewDebate = () => {
    setPrompt('');
    setDebateComplete(false);
    onReset?.();
  };

  return (
    <div className="max-w-input mx-auto mt-12 mb-10">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {/* Input container */}
          <div className="relative bg-bg-surface border border-border rounded-lg overflow-hidden focus-within:border-accent-primary focus-within:shadow-glow-accent transition-all duration-200">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What should the AIs debate today?"
              disabled={isLoading}
              className="w-full bg-transparent text-text-primary placeholder-text-muted px-5 py-4 pr-32 text-base font-body outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            
            {/* Submit button inside input */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {debateComplete && onReset ? (
                <button
                  type="button"
                  onClick={handleNewDebate}
                  className="bg-success hover:bg-success/90 text-white font-semibold text-sm py-3 px-6 rounded-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  New
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className="bg-accent-primary hover:bg-accent-hover text-white font-semibold text-sm py-3 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 flex items-center gap-2"
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
      </form>

      {/* Example prompts */}
      <div className="mt-6">
        <p className="text-text-tertiary text-caption mb-3">Try an example:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => handleExampleClick(example)}
              disabled={isLoading}
              className="text-body-small text-text-secondary bg-bg-elevated border border-border rounded-full px-4 py-2 hover:text-text-primary hover:border-accent-primary hover:bg-bg-subtle disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
