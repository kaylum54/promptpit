'use client';

import { useState } from 'react';
import { redirectToCheckout } from '@/lib/stripe-client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('free');

  const handleSignIn = () => {
    // Redirect to Auth0 login with returnTo for dashboard
    const params = new URLSearchParams();
    params.set('returnTo', '/dashboard?welcome=true');
    window.location.href = `/auth/login?${params.toString()}`;
  };

  const handleSignUp = () => {
    // Store selected plan for after login
    if (selectedPlan === 'pro') {
      localStorage.setItem('pendingProUpgrade', 'true');
    }
    // Redirect to Auth0 signup with returnTo for dashboard
    const params = new URLSearchParams();
    params.set('screen_hint', 'signup');
    params.set('returnTo', '/dashboard?welcome=true');
    window.location.href = `/auth/login?${params.toString()}`;
  };

  const handleClose = () => {
    setSelectedPlan('free');
    onClose();
  };

  const handleContinueAsGuest = () => {
    setSelectedPlan('free');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-[400px] mx-4 border border-border rounded-xl shadow-lg shadow-glow-md animate-scale-in overflow-hidden"
        style={{ background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)' }}
      >
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-all duration-200"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="pb-4 mb-4 border-b border-border-subtle">
            <h2 className="text-section-header text-text-primary text-center mb-2">
              Welcome to PromptPit
            </h2>
            <p className="text-body-small text-text-secondary text-center">
              Sign in or create an account to continue
            </p>
          </div>

          {/* Plan Selection */}
          <div className="space-y-2 mb-6">
            {/* Free Plan */}
            <button
              type="button"
              onClick={() => setSelectedPlan('free')}
              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left flex items-center justify-between ${
                selectedPlan === 'free'
                  ? 'border-success bg-success/5'
                  : 'border-border hover:border-border-strong'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'free' ? 'border-success bg-success' : 'border-text-muted'
                }`}>
                  {selectedPlan === 'free' && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-text-primary">Free</span>
                  <span className="text-sm text-text-secondary ml-2">1 full PRD</span>
                </div>
              </div>
              <span className="font-bold text-text-primary">$0</span>
            </button>

            {/* Pro Plan */}
            <button
              type="button"
              onClick={() => setSelectedPlan('pro')}
              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left flex items-center justify-between relative ${
                selectedPlan === 'pro'
                  ? 'border-accent-primary bg-accent-primary/5'
                  : 'border-border hover:border-border-strong'
              }`}
            >
              <span className="absolute -top-2 right-3 bg-accent-primary text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                POPULAR
              </span>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'pro' ? 'border-accent-primary bg-accent-primary' : 'border-text-muted'
                }`}>
                  {selectedPlan === 'pro' && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-text-primary">Pro</span>
                  <span className="text-sm text-text-secondary ml-2">Unlimited PRDs + Pro tools</span>
                </div>
              </div>
              <span className="font-bold text-text-primary">$20<span className="text-xs text-text-muted">/mo</span></span>
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSignUp}
              className={`w-full hover:translate-y-[-1px] text-white font-semibold py-3 px-6 rounded-md transition-all duration-200 flex items-center justify-center gap-2 shadow-lg min-h-[44px] ${
                selectedPlan === 'pro'
                  ? 'bg-accent-primary hover:bg-accent-hover hover:shadow-glow-accent'
                  : 'bg-success hover:bg-success/90'
              }`}
            >
              {selectedPlan === 'pro' ? 'Sign Up & Continue to Payment' : 'Sign Up Free'}
            </button>

            <button
              onClick={handleSignIn}
              className="w-full text-text-primary hover:text-text-primary font-medium py-3 px-6 rounded-md border border-border hover:border-border-strong hover:bg-bg-elevated transition-all duration-200 min-h-[44px]"
            >
              Already have an account? Sign In
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-bg-surface text-text-tertiary">or</span>
            </div>
          </div>

          {/* Continue as guest */}
          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="w-full text-text-tertiary hover:text-text-primary font-medium py-3 px-6 rounded-md border border-border hover:border-border-strong hover:bg-bg-elevated transition-all duration-200 min-h-[44px]"
          >
            Continue as Guest
          </button>

          {/* Google/Social hint */}
          <p className="text-center text-sm text-text-tertiary mt-4">
            Sign in with email or Google
          </p>
        </div>
      </div>
    </div>
  );
}
