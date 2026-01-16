'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PRDOutputView } from '@/components/dashboard/PRDOutput';
import type { PRD, PRDReview } from '@/lib/types';

export default function PRDOutputPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [prd, setPrd] = useState<PRD | null>(null);
  const [reviews, setReviews] = useState<PRDReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch PRD data
  const fetchPRD = useCallback(async () => {
    try {
      const response = await fetch(`/api/prd/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/dashboard/prd');
          return;
        }
        throw new Error('Failed to fetch PRD');
      }
      const data = await response.json();
      setPrd(data.prd);
      setReviews(data.reviews || []);

      // Redirect if not completed
      if (data.prd.status !== 'completed' && data.prd.status !== 'review') {
        router.push(`/dashboard/prd/${id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchPRD();
  }, [fetchPRD]);

  // Trigger reviews
  const handleTriggerReviews = async () => {
    try {
      const response = await fetch(`/api/prd/${id}/review`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to trigger reviews');
      const data = await response.json();
      setReviews(data.reviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading your PRD...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading PRD</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => fetchPRD()}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!prd) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📄</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">PRD not found</h2>
          <p className="text-gray-500">This PRD may have been deleted or you don't have access.</p>
        </div>
      </div>
    );
  }

  return (
    <PRDOutputView
      prd={prd}
      reviews={reviews}
      onTriggerReviews={handleTriggerReviews}
    />
  );
}
