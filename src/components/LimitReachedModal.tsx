'use client';

import { useState } from 'react';
import { redirectToCheckout } from '@/lib/stripe-client';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  debatesUsed: number;
  debatesLimit: number;
  tier: 'guest' | 'free' | 'pro';
  monthResetDate: string;
  isAuthenticated: boolean;
  onAuthRequired?: () => void;
}

export default function LimitReachedModal({
  isOpen,
  onClose,
  debatesUsed,
  debatesLimit,
  tier,
  monthResetDate,
  isAuthenticated,
  onAuthRequired,
}: LimitReachedModalProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      onClose();
      return;
    }

    setError(null);
    setIsUpgrading(true);
    try {
      await redirectToCheckout('pro');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start upgrade. Please try again.');
      setIsUpgrading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-[400px] mx-4 border border-border rounded-xl shadow-lg shadow-glow-md animate-scale-in overflow-hidden"
        style={{ background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)' }}
      >
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-warning/50 to-transparent" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-all duration-200"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-warning"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="border-b border-border-subtle pb-4 mb-4">
            <h2 className="text-section-header text-text-primary text-center">
              You&apos;ve reached your monthly limit
            </h2>
          </div>

          {/* Usage display */}
          <div className="bg-bg-elevated rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-body-small text-text-secondary">Debates used</span>
              <span className="text-body-small text-text-primary font-semibold">
                {debatesUsed}/{debatesLimit}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-warning rounded-full transition-all duration-300"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Reset date */}
          <p className="text-body-small text-text-secondary text-center mb-6">
            Resets on {monthResetDate}
          </p>

          {/* Tier-specific content */}
          {tier === 'guest' ? (
            <>
              {/* Sign Up Benefits */}
              <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-success mb-2 text-sm">Create a Free Account</h4>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    6 debates per month (5 more!)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Save your debate history
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    100% free, no credit card
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  onAuthRequired?.();
                  onClose();
                }}
                className="w-full bg-success hover:bg-success/90 hover:translate-y-[-1px] text-white font-semibold py-3 px-6 rounded-md text-center transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
              >
                Sign Up Free
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full text-text-tertiary hover:text-text-primary font-medium py-3 px-6 rounded-md border border-border hover:border-border-strong hover:bg-bg-elevated transition-all duration-200 mt-3 min-h-[44px]"
              >
                Maybe Later
              </button>
            </>
          ) : tier === 'free' ? (
            <>
              {/* Pro Benefits Highlight */}
              <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-accent-primary mb-2 text-sm">Upgrade to Pro</h4>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-accent-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    100 debates per month
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-accent-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Full history access
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-accent-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Priority support
                  </li>
                </ul>
              </div>

              {/* Error */}
              {error && (
                <div className="text-error text-sm bg-error/10 border border-error/20 rounded-lg p-3 mb-4">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="w-full bg-accent-primary hover:bg-accent-hover hover:translate-y-[-1px] text-white font-semibold py-3 px-6 rounded-md text-center transition-all duration-200 shadow-lg hover:shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isUpgrading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Upgrade to Pro - $11/month'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isUpgrading}
                className="w-full text-text-tertiary hover:text-text-primary font-medium py-3 px-6 rounded-md border border-border hover:border-border-strong hover:bg-bg-elevated transition-all duration-200 mt-3 disabled:opacity-50 min-h-[44px]"
              >
                Maybe Later
              </button>
            </>
          ) : (
            <>
              <p className="text-body-small text-text-secondary text-center mb-6">
                You&apos;ve used all your Pro debates for this month. Your limit will reset automatically on the date shown above.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-accent-primary hover:bg-accent-hover hover:translate-y-[-1px] text-white font-semibold py-3 px-6 rounded-md transition-all duration-200 shadow-lg hover:shadow-glow-accent min-h-[44px]"
              >
                Got It
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
