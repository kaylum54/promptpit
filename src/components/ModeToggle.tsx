'use client';

import { useState } from 'react';

export type AppMode = 'quick' | 'debate';

interface ModeToggleProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
  isPro: boolean;
  onUpgradeClick?: () => void;
  disabled?: boolean;
}

export default function ModeToggle({
  mode,
  onChange,
  isPro,
  onUpgradeClick,
  disabled = false,
}: ModeToggleProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleQuickClick = () => {
    if (disabled) return;

    if (!isPro) {
      // Show upgrade prompt
      if (onUpgradeClick) {
        onUpgradeClick();
      }
      return;
    }
    onChange('quick');
  };

  const handleDebateClick = () => {
    if (disabled) return;
    onChange('debate');
  };

  return (
    <div className="flex items-center gap-2">
      {/* Quick Mode Button */}
      <button
        onClick={handleQuickClick}
        onMouseEnter={() => !isPro && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={disabled}
        className={`
          relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
          transition-all duration-150 ease-out
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${
            mode === 'quick'
              ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/20'
              : 'bg-bg-surface border border-border text-text-secondary hover:bg-bg-elevated hover:border-border-strong hover:text-text-primary'
          }
        `}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <span>Quick</span>
        {!isPro && (
          <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-bg-base border border-border rounded text-text-muted">
            PRO
          </span>
        )}

        {/* Tooltip for non-Pro users */}
        {showTooltip && !isPro && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-bg-elevated border border-border rounded-lg shadow-lg text-xs text-text-secondary whitespace-nowrap z-50">
            <div className="font-medium text-text-primary mb-1">Quick Mode</div>
            <div>Get instant AI responses with smart routing</div>
            <div className="text-accent-primary mt-1">Upgrade to Pro to unlock</div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="border-8 border-transparent border-t-border" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 border-[7px] border-transparent border-t-bg-elevated" />
            </div>
          </div>
        )}
      </button>

      {/* Debate Mode Button */}
      <button
        onClick={handleDebateClick}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
          transition-all duration-150 ease-out
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${
            mode === 'debate'
              ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/20'
              : 'bg-bg-surface border border-border text-text-secondary hover:bg-bg-elevated hover:border-border-strong hover:text-text-primary'
          }
        `}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span>Debate</span>
      </button>
    </div>
  );
}
