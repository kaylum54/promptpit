'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const initialPlan = searchParams.get('plan') === 'pro' ? 'pro' : 'free';
  const verifyPending = searchParams.get('verify') === 'pending';

  const { user, isLoading, signIn, signUp } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>(initialPlan);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  // Handle login/signup with Auth0
  const handleAuth = (mode: 'signin' | 'signup') => {
    // Store pending pro upgrade if selecting pro plan
    if (mode === 'signup' && selectedPlan === 'pro') {
      localStorage.setItem('pendingProUpgrade', 'true');
    }

    // For sign in (including after email verification), redirect to dashboard with welcome message
    // For sign up, use the default returnTo (verify pending page)
    if (mode === 'signup' && !verifyPending) {
      signUp(); // Uses default returnTo from useAuth (verify pending page)
    } else {
      signIn('/dashboard?welcome=true'); // Redirect to dashboard with welcome toast
    }
  };

  // Show loading while checking auth state or if user is authenticated (will redirect)
  if (isLoading || user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Home</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-2xl font-semibold text-gray-900">PromptPit</span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-8">
              {/* Email Verification Pending Message */}
              {verifyPending && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">Check your email!</p>
                      <p className="text-sm text-blue-600 mt-1">
                        We&apos;ve sent you a verification link. Please check your inbox and click the link to verify your email address, then sign in below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {verifyPending ? 'Verify your email' : (initialMode === 'signup' ? 'Create your account' : 'Welcome back')}
                </h1>
                <p className="text-gray-500">
                  {verifyPending
                    ? 'Once verified, sign in to continue'
                    : (initialMode === 'signup'
                      ? 'Get started with PromptPit today'
                      : 'Sign in to continue to your dashboard')}
                </p>
              </div>

              {/* Plan Selection (for signup, not shown when verify pending) */}
              {initialMode === 'signup' && !verifyPending && (
                <div className="space-y-3 mb-6">
                  {/* Free Plan */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('free')}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                      selectedPlan === 'free'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === 'free' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                      }`}>
                        {selectedPlan === 'free' && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Free</span>
                        <span className="text-sm text-gray-500 ml-2">1 full PRD</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">$0</span>
                  </button>

                  {/* Pro Plan */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('pro')}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between relative ${
                      selectedPlan === 'pro'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="absolute -top-2 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      BEST VALUE
                    </span>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === 'pro' ? 'border-amber-500 bg-amber-500' : 'border-gray-300'
                      }`}>
                        {selectedPlan === 'pro' && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Pro</span>
                        <span className="text-sm text-gray-500 ml-2">Unlimited PRDs + Pro tools</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">$20<span className="text-xs text-gray-500">/mo</span></span>
                  </button>
                </div>
              )}

              {/* Auth Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleAuth(verifyPending ? 'signin' : initialMode)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    initialMode === 'signup' && selectedPlan === 'pro' && !verifyPending
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {verifyPending ? (
                    'Sign In to Continue'
                  ) : initialMode === 'signup' ? (
                    selectedPlan === 'pro' ? 'Sign Up & Continue to Payment' : 'Sign Up Free'
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* Google OAuth hint */}
                <p className="text-center text-sm text-gray-500">
                  Sign in with email or Google
                </p>
              </div>

              {/* Toggle mode (hide when verify pending) */}
              {!verifyPending && (
                <div className="mt-6 text-center">
                  {initialMode === 'signup' ? (
                    <p className="text-sm text-gray-500">
                      Already have an account?{' '}
                      <Link href="/login?mode=signin" className="text-gray-900 font-medium hover:underline">
                        Sign in
                      </Link>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Don&apos;t have an account?{' '}
                      <Link href="/login?mode=signup" className="text-gray-900 font-medium hover:underline">
                        Sign up
                      </Link>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-400 mt-6">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
