'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PRICING_TIERS } from '@/lib/pricing';
import { useAuth } from '@/hooks/useAuth';
import { redirectToCheckout, redirectToPortal } from '@/lib/stripe-client';
import AuthModal from '@/components/AuthModal';

export default function PricingPage() {
  const { user, profile, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPro = profile?.tier === 'pro';

  const handleUpgrade = async () => {
    setError(null);

    // If not logged in, show auth modal
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setIsCheckoutLoading(true);
      await redirectToCheckout('pro');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setIsCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setError(null);
    try {
      setIsCheckoutLoading(true);
      await redirectToPortal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {/* Header */}
      <header className="h-16 border-b border-border-subtle bg-bg-base/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 hover:opacity-80 transition-opacity">
            <Image src="/logo.jpeg" alt="PromptPit" width={120} height={40} className="rounded-md -mt-1" />
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 sm:px-4 py-2 rounded-md hover:bg-bg-elevated transition-colors min-h-[44px] flex items-center"
            >
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3 sm:mb-4">Pricing</h1>
            <p className="text-base sm:text-lg text-text-secondary">
              Choose the plan that&apos;s right for you
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-error/10 border border-error/20 rounded-lg text-center">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Free Tier */}
            <div className="bg-bg-surface border border-border rounded-xl p-6 sm:p-8 flex flex-col">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                  {PRICING_TIERS.free.name}
                </h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-text-primary">$0</span>
                  <span className="text-text-secondary">/month</span>
                </div>
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">
                {PRICING_TIERS.free.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-success mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm sm:text-base text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/"
                className="w-full py-3 px-6 rounded-lg bg-bg-elevated border border-border text-text-primary font-medium text-center hover:bg-bg-subtle hover:border-border-strong transition-colors min-h-[44px] flex items-center justify-center"
              >
                {user ? 'Continue Free' : 'Get Started'}
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-bg-surface border-2 border-accent-primary rounded-xl p-6 sm:p-8 flex flex-col relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-transparent pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                      {PRICING_TIERS.pro.name}
                    </h2>
                    <span className="px-2 py-0.5 text-xs font-medium bg-accent-primary/20 text-accent-primary rounded-full">
                      Popular
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-bold text-text-primary">$11</span>
                    <span className="text-text-secondary">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">
                  {PRICING_TIERS.pro.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-accent-primary mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm sm:text-base text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isLoading ? (
                  <button
                    disabled
                    className="w-full py-3 px-6 rounded-lg bg-accent-primary/50 text-white font-medium text-center flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Loading...</span>
                  </button>
                ) : isPro ? (
                  <button
                    onClick={handleManageSubscription}
                    disabled={isCheckoutLoading}
                    className="w-full py-3 px-6 rounded-lg bg-bg-elevated border border-border text-text-primary font-medium text-center hover:bg-bg-subtle transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    {isCheckoutLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-text-muted/30 border-t-text-primary rounded-full animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      'Manage Subscription'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleUpgrade}
                    disabled={isCheckoutLoading}
                    className="w-full py-3 px-6 rounded-lg bg-accent-primary hover:bg-accent-hover text-white font-medium text-center transition-colors disabled:opacity-50 hover:translate-y-[-1px] hover:shadow-glow-accent min-h-[44px]"
                  >
                    {isCheckoutLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Upgrade to Pro'
                    )}
                  </button>
                )}

                {isPro && (
                  <p className="text-center text-text-tertiary text-xs mt-3">
                    You&apos;re currently on the Pro plan
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 sm:mt-12 text-center space-y-3 sm:space-y-4">
            <p className="text-text-tertiary text-sm px-4">
              All plans include access to Claude, GPT-4o, Gemini, and Llama models.
            </p>
            <p className="text-text-muted text-xs">
              Secure payments powered by Stripe. Cancel anytime.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle px-4 sm:px-6 py-4">
        <div className="max-w-[1400px] mx-auto text-center text-text-muted text-sm">
          Powered by OpenRouter
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          // After successful auth, trigger checkout
          handleUpgrade();
        }}
      />
    </div>
  );
}
