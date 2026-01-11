'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password);

      if (result.error) {
        setError(result.error);
      } else {
        setEmail('');
        setPassword('');
        setError('');
        onSuccess?.();
        onClose();
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
          {/* Header */}
          <div className="pb-4 mb-4 border-b border-border-subtle">
            <h2 className="text-section-header text-text-primary text-center mb-2">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-body-small text-text-secondary text-center">
              Get 15 free debates per month
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-bg-elevated rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); }}
              className={"flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 " + (mode === 'signin' ? 'bg-accent-primary text-white' : 'text-text-tertiary hover:text-text-primary')}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={"flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 " + (mode === 'signup' ? 'bg-accent-primary text-white' : 'text-text-tertiary hover:text-text-primary')}
            >
              Sign Up
            </button>
          </div>

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
              className="w-full bg-accent-primary hover:bg-accent-hover hover:translate-y-[-1px] text-white font-semibold py-3 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-glow-accent"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <span>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
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
            className="w-full text-text-tertiary hover:text-text-primary font-medium py-3 px-6 rounded-md border border-border hover:border-border-strong hover:bg-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
