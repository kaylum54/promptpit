'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { redirectToCheckout } from '@/lib/stripe-client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState<'auth' | 'confirm'>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('free');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          setEmail('');
          setPassword('');
          setError('');

          // Check if user had selected Pro during signup and redirect to checkout
          const pendingProUpgrade = localStorage.getItem('pendingProUpgrade');
          if (pendingProUpgrade === 'true') {
            localStorage.removeItem('pendingProUpgrade');
            onSuccess?.();
            onClose();
            // Redirect to Stripe checkout after modal closes
            setTimeout(() => {
              redirectToCheckout('pro');
            }, 100);
          } else {
            onSuccess?.();
            onClose();
          }
        }
      } else {
        // Signup - check if email already exists (optional - Supabase handles this too)
        try {
          const checkResponse = await fetch('/api/auth/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          if (checkResponse.ok) {
            const { exists } = await checkResponse.json();
            if (exists) {
              setError('An account with this email already exists. Please sign in instead.');
              setIsSubmitting(false);
              return;
            }
          }
          // If check fails, proceed with signup - Supabase will catch duplicates
        } catch {
          // Network error - proceed with signup, Supabase will handle duplicates
        }

        // Signup
        const result = await signUp(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          // Store selected plan for after email confirmation
          if (selectedPlan === 'pro') {
            localStorage.setItem('pendingProUpgrade', 'true');
          }
          setError('');
          setStep('confirm'); // Move to email confirmation step
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    setStep('auth');
    setSelectedPlan('free');
    onClose();
  };

  const handleContinueAsGuest = () => {
    setEmail('');
    setPassword('');
    setError('');
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
          {step === 'auth' ? (
            <>
              {/* Header */}
              <div className="pb-4 mb-4 border-b border-border-subtle">
                <h2 className="text-section-header text-text-primary text-center mb-2">
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </h2>
                <p className="text-body-small text-text-secondary text-center">
                  {mode === 'signin' ? 'Welcome back!' : 'Choose your plan to get started'}
                </p>
              </div>

              {/* Tab toggle */}
              <div className="flex bg-bg-elevated rounded-lg p-1 mb-6">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); setSelectedPlan('free'); }}
                  className={"flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 min-h-[44px] " + (mode === 'signin' ? 'bg-accent-primary text-white' : 'text-text-tertiary hover:text-text-primary')}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); }}
                  className={"flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 min-h-[44px] " + (mode === 'signup' ? 'bg-accent-primary text-white' : 'text-text-tertiary hover:text-text-primary')}
                >
                  Sign Up
                </button>
              </div>

              {/* Plan Selection for Signup */}
              {mode === 'signup' && (
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
                        <span className="text-sm text-text-secondary ml-2">6 debates/month</span>
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
                        <span className="text-sm text-text-secondary ml-2">100 debates/month</span>
                      </div>
                    </div>
                    <span className="font-bold text-text-primary">$11<span className="text-xs text-text-muted">/mo</span></span>
                  </button>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-caption text-text-secondary mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={isSubmitting}
                    className="w-full bg-bg-surface text-text-primary placeholder-text-muted rounded-lg px-4 py-3 border border-border focus:border-accent-primary focus:shadow-glow-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-caption text-text-secondary mb-1.5">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isSubmitting}
                    minLength={6}
                    className="w-full bg-bg-surface text-text-primary placeholder-text-muted rounded-lg px-4 py-3 border border-border focus:border-accent-primary focus:shadow-glow-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="text-error text-sm bg-error/10 border border-error/20 rounded-lg p-3 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || !email || !password}
                  className={`w-full hover:translate-y-[-1px] text-white font-semibold py-3 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg min-h-[44px] ${
                    mode === 'signup' && selectedPlan === 'pro'
                      ? 'bg-accent-primary hover:bg-accent-hover hover:shadow-glow-accent'
                      : mode === 'signup'
                      ? 'bg-success hover:bg-success/90'
                      : 'bg-accent-primary hover:bg-accent-hover hover:shadow-glow-accent'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
                    </>
                  ) : mode === 'signin' ? (
                    <span>Sign In</span>
                  ) : selectedPlan === 'pro' ? (
                    <span>Sign Up & Continue to Payment</span>
                  ) : (
                    <span>Sign Up Free</span>
                  )}
                </button>
              </form>

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
                disabled={isSubmitting}
                className="w-full text-text-tertiary hover:text-text-primary font-medium py-3 px-6 rounded-md border border-border hover:border-border-strong hover:bg-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-h-[44px]"
              >
                Continue as Guest
              </button>
            </>
          ) : (
            <>
              {/* Email Confirmation Step */}
              <div className="text-center">
                {/* Success Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-success"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="text-section-header text-text-primary mb-2">
                  Check Your Email
                </h2>
                <p className="text-body-small text-text-secondary mb-4">
                  We&apos;ve sent a confirmation link to <span className="font-medium text-text-primary">{email}</span>.
                  Please click the link to activate your account, then sign back in.
                </p>

                {selectedPlan === 'pro' && (
                  <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-3 mb-4">
                    <p className="text-sm text-accent-primary">
                      After confirming your email and signing in, you&apos;ll be redirected to complete your Pro subscription payment.
                    </p>
                  </div>
                )}

                <div className="bg-bg-elevated rounded-lg p-4 mb-6 border border-border-subtle">
                  <p className="text-sm text-text-tertiary">
                    Didn&apos;t receive the email? Check your spam folder or try signing up again.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep('auth');
                    setMode('signin');
                    setPassword('');
                  }}
                  className="w-full bg-accent-primary hover:bg-accent-hover hover:translate-y-[-1px] text-white font-semibold py-3 px-6 rounded-md transition-all duration-200 shadow-lg hover:shadow-glow-accent min-h-[44px]"
                >
                  Sign In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
