'use client';

import { useState } from 'react';

interface ShareButtonProps {
  debateId: string;
  initialShareId?: string | null;
  isPublic?: boolean;
  size?: 'sm' | 'md';
}

export default function ShareButton({
  debateId,
  initialShareId = null,
  isPublic = false,
  size = 'sm',
}: ShareButtonProps) {
  const [shareId, setShareId] = useState<string | null>(initialShareId);
  const [isShared, setIsShared] = useState(isPublic);
  const [isLoading, setIsLoading] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/debates/${debateId}/share`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create share link');
      }

      const data = await response.json();
      setShareId(data.shareId);
      setIsShared(true);

      // Copy to clipboard
      await navigator.clipboard.writeText(data.shareUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      setError('Failed to share');
      console.error('Share error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareId) return;

    const shareUrl = `${window.location.origin}/share/${shareId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleUnshare = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/debates/${debateId}/share`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove share link');
      }

      setIsShared(false);
    } catch (err) {
      setError('Failed to unshare');
      console.error('Unshare error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClasses = size === 'sm'
    ? 'px-2 py-1 text-xs'
    : 'px-3 py-2 text-sm';

  if (isShared && shareId) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleCopyLink}
          className={`${buttonClasses} rounded-md bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-colors flex items-center gap-1`}
          title="Copy share link"
        >
          {showCopied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Shared
            </>
          )}
        </button>
        <button
          onClick={handleUnshare}
          disabled={isLoading}
          className={`${buttonClasses} rounded-md text-text-muted hover:text-error hover:bg-error/10 transition-colors`}
          title="Make private"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleShare}
      disabled={isLoading}
      className={`${buttonClasses} rounded-md bg-bg-base hover:bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1`}
      title="Share this debate"
    >
      {isLoading ? (
        <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      )}
      {error || 'Share'}
    </button>
  );
}
