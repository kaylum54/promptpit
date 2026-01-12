'use client';

import { useState } from 'react';

interface PrivacyToggleProps {
  debateId: string;
  isPublic: boolean;
  onToggle?: (newValue: boolean) => void;
  disabled?: boolean;
}

export default function PrivacyToggle({
  debateId,
  isPublic,
  onToggle,
  disabled = false,
}: PrivacyToggleProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    if (disabled || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/debates/${debateId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_public: !isPublic }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update visibility');
      }

      onToggle?.(!isPublic);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update visibility';
      setError(message);
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = disabled || loading;

  return (
    <div className="relative inline-block">
      <button
        onClick={handleToggle}
        disabled={isDisabled}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5
          text-sm font-medium rounded-md
          border transition-all duration-200
          ${isDisabled
            ? 'cursor-not-allowed opacity-50 bg-gray-100 border-gray-200 text-gray-400'
            : isPublic
              ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
        `}
        aria-label={isPublic ? 'Make debate private' : 'Make debate public'}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Updating...</span>
          </>
        ) : (
          <>
            <span className="text-base" role="img" aria-hidden="true">
              {isPublic ? '🔓' : '🔒'}
            </span>
            <span>{isPublic ? 'Public' : 'Private'}</span>
          </>
        )}
      </button>

      {error && (
        <div className="absolute top-full left-0 mt-1 z-10">
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
