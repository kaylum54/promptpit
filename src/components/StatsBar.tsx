'use client';

import { useEffect, useState } from 'react';

interface StatsBarProps {
  className?: string;
}

interface PublicStats {
  totalDebates: number;
  debatesToday: number;
  leadingModel: {
    name: string;
    winRate: number;
  };
}

export function StatsBar({ className = '' }: StatsBarProps) {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats/public');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
        setError(false);
      } catch (err) {
        console.error('Error fetching public stats:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  // Hide the bar if there's an error
  if (error) {
    return null;
  }

  return (
    <div
      className={`border-y border-border-subtle py-3 px-4 text-center ${className}`}
    >
      {loading ? (
        // Skeleton loading state
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-24 animate-pulse rounded bg-bg-tertiary" />
          <span className="text-text-tertiary">·</span>
          <div className="h-4 w-36 animate-pulse rounded bg-bg-tertiary" />
          <span className="text-text-tertiary">·</span>
          <div className="h-4 w-20 animate-pulse rounded bg-bg-tertiary" />
        </div>
      ) : stats ? (
        <p className="text-sm text-text-tertiary">
          <span className="mr-1">📊</span>
          <span className="text-text-secondary font-medium">
            {formatNumber(stats.totalDebates)}
          </span>{' '}
          battles
          <span className="mx-2">·</span>
          {stats.leadingModel.name} leads with{' '}
          <span className="text-text-secondary font-medium">
            {stats.leadingModel.winRate}%
          </span>{' '}
          wins
          <span className="mx-2">·</span>
          <span className="text-text-secondary font-medium">
            {formatNumber(stats.debatesToday)}
          </span>{' '}
          today
        </p>
      ) : null}
    </div>
  );
}

export default StatsBar;
