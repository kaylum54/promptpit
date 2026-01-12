'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackCategory = 'bug' | 'feature' | 'general';

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { user } = useAuth();

  const [category, setCategory] = useState<FeedbackCategory>('general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Pre-fill email when user is logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  // Auto-close after success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        handleClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate message length
    if (message.trim().length < 10) {
      setError('Message must be at least 10 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          message: message.trim(),
          email: email.trim() || undefined,
          page_url: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit feedback. Please try again.');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCategory('general');
    setMessage('');
    setEmail(user?.email || '');
    setError('');
    setIsSuccess(false);
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
          {isSuccess ? (
            /* Success State */
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-section-header text-text-primary mb-2">
                Thank You!
              </h2>
              <p className="text-body-small text-text-secondary">
                Your feedback has been submitted successfully.
              </p>
            </div>
          ) : (
            /* Form State */
            <>
              {/* Header */}
              <div className="pb-4 mb-4 border-b border-border-subtle">
                <h2 className="text-section-header text-text-primary text-center mb-2">
                  Send Feedback
                </h2>
                <p className="text-body-small text-text-secondary text-center">
                  Help us improve by sharing your thoughts
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Dropdown */}
                <div>
                  <label htmlFor="category" className="block text-caption text-text-secondary mb-1.5">
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                    disabled={isSubmitting}
                    className="w-full bg-bg-surface text-text-primary rounded-lg px-4 py-3 border border-border focus:border-accent-primary focus:shadow-glow-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '20px',
                    }}
                  >
                    <option value="general">General Feedback</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                  </select>
                </div>

                {/* Message Textarea */}
                <div>
                  <label htmlFor="message" className="block text-caption text-text-secondary mb-1.5">
                    Message <span className="text-error">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what's on your mind... (min 10 characters)"
                    required
                    minLength={10}
                    disabled={isSubmitting}
                    rows={4}
                    className="w-full bg-bg-surface text-text-primary placeholder-text-muted rounded-lg px-4 py-3 border border-border focus:border-accent-primary focus:shadow-glow-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none"
                  />
                  <p className="text-xs text-text-tertiary mt-1">
                    {message.length}/10 minimum characters
                  </p>
                </div>

                {/* Email Field (Optional) */}
                <div>
                  <label htmlFor="email" className="block text-caption text-text-secondary mb-1.5">
                    Email <span className="text-text-tertiary">(optional)</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={isSubmitting}
                    className="w-full bg-bg-surface text-text-primary placeholder-text-muted rounded-lg px-4 py-3 border border-border focus:border-accent-primary focus:shadow-glow-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                  <p className="text-xs text-text-tertiary mt-1">
                    We&apos;ll only use this to follow up if needed
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="text-error text-sm bg-error/10 border border-error/20 rounded-lg p-3 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || message.trim().length < 10}
                  className="w-full bg-accent-primary hover:bg-accent-hover hover:translate-y-[-1px] text-white font-semibold py-3 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-glow-accent"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Feedback</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
