'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { PRD } from '@/lib/types';

export default function PRDListPage() {
  const [prds, setPrds] = useState<PRD[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPRDs();
  }, []);

  async function fetchPRDs() {
    try {
      const response = await fetch('/api/prd');
      if (!response.ok) throw new Error('Failed to fetch PRDs');
      const data = await response.json();
      setPrds(data.prds || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: PRD['status']) => {
    const styles = {
      in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      review: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    const labels = {
      in_progress: 'In Progress',
      review: 'In Review',
      completed: 'Completed',
      archived: 'Archived',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getModeLabel = (mode: PRD['mode']) => {
    return mode === 'quick' ? 'Quick PRD' : 'Full Build Plan';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">PRD Builder</h1>
          <p className="text-gray-400">
            Turn your ideas into production-ready specifications
          </p>
        </div>
        <Link
          href="/dashboard/prd/new"
          className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          New PRD
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* PRD List */}
      {prds.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-700 rounded-xl">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-white mb-2">No PRDs yet</h3>
          <p className="text-gray-400 mb-6">
            Create your first PRD to get started
          </p>
          <Link
            href="/dashboard/prd/new"
            className="inline-flex items-center px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <span className="mr-2">+</span>
            Create PRD
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {prds.map((prd) => (
            <Link
              key={prd.id}
              href={`/dashboard/prd/${prd.id}`}
              className="block p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate mb-1">
                    {prd.title || 'Untitled PRD'}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>{getModeLabel(prd.mode)}</span>
                    <span>•</span>
                    <span>Phase {prd.current_phase}</span>
                    <span>•</span>
                    <span>
                      {new Date(prd.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  {getStatusBadge(prd.status)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
