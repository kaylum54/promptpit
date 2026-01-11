'use client';

import Link from 'next/link';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  debatesUsed: number;
  debatesLimit: number;
  tier: 'free' | 'pro';
  monthResetDate: string;
}

export default function LimitReachedModal({
  isOpen,
  onClose,
  debatesUsed,
  debatesLimit,
  tier,
  monthResetDate,
}: LimitReachedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[400px] mx-4 bg-bg-surface border border-border rounded-xl shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-tertiary hover:text-text-secondary transition-colors"
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
          <h2 className="text-section-header text-text-primary text-center mb-2">
            You&apos;ve reached your monthly limit
          </h2>

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
          {tier === 'free' ? (
            <>
              <p className="text-body-small text-text-secondary text-center mb-4">
                Upgrade to Pro to get unlimited debates and unlock premium features.
              </p>
              <Link
                href="/pricing"
                onClick={onClose}
                className="block w-full bg-accent-primary hover:bg-accent-hover text-white font-semibold py-3 px-6 rounded-md text-center transition-all duration-200"
              >
                Upgrade to Pro
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-full text-text-tertiary hover:text-text-primary font-medium py-3 px-6 rounded-md border border-border hover:border-border-strong hover:bg-bg-elevated transition-all duration-200 mt-3"
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
                className="w-full bg-accent-primary hover:bg-accent-hover text-white font-semibold py-3 px-6 rounded-md transition-all duration-200"
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
