'use client';

import Link from 'next/link';
import { PRICING_TIERS } from '@/lib/pricing';

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {/* Header */}
      <header className="h-16 border-b border-border-subtle bg-bg-base/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-xl">&#x1F3DF;</span>
            <h1 className="text-xl font-bold text-text-primary">PromptPit</h1>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-text-secondary hover:text-text-primary px-4 py-2 rounded-md hover:bg-bg-elevated transition-colors"
            >
              Back to Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-text-primary mb-4">Pricing</h1>
            <p className="text-lg text-text-secondary">
              Choose the plan that&apos;s right for you
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="bg-bg-surface border border-border rounded-xl p-8 flex flex-col">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  {PRICING_TIERS.free.name}
                </h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-text-primary">$0</span>
                  <span className="text-text-secondary">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
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
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/"
                className="w-full py-3 px-6 rounded-lg bg-bg-elevated border border-border text-text-primary font-medium text-center hover:bg-bg-subtle hover:border-border-strong transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-bg-surface border-2 border-accent-primary rounded-xl p-8 flex flex-col relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-text-primary">
                      {PRICING_TIERS.pro.name}
                    </h2>
                    <span className="px-2 py-0.5 text-xs font-medium bg-accent-primary/20 text-accent-primary rounded-full">
                      Popular
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-text-primary">$9.99</span>
                    <span className="text-text-secondary">/month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
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
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  disabled
                  className="w-full py-3 px-6 rounded-lg bg-accent-primary/50 text-text-primary/70 font-medium text-center cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-text-tertiary text-sm">
              All plans include access to Claude, GPT-4o, Gemini, and Llama models.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle px-6 py-4">
        <div className="max-w-[1400px] mx-auto text-center text-text-muted text-sm">
          Powered by OpenRouter
        </div>
      </footer>
    </div>
  );
}
