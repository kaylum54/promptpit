'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDashboard } from '@/contexts/DashboardContext';
import { DashboardHome } from '@/components/dashboard/DashboardHome';

function DashboardPageContent() {
  const { prds, user } = useDashboard();
  const searchParams = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(false);

  // Show welcome message if user just logged in
  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setShowWelcome(true);
      // Remove the welcome param from URL without refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('welcome');
      window.history.replaceState({}, '', url.pathname);
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Convert PRDs to the format expected by DashboardHome
  const projects = prds.map(prd => ({
    id: prd.id,
    name: prd.title || 'Untitled PRD',
    status: (prd.status === 'completed' ? 'launched' :
             prd.status === 'review' ? 'building' :
             prd.status === 'in_progress' ? 'prd' : 'idea') as 'idea' | 'prd' | 'building' | 'launched',
    phase: prd.current_phase,
    updatedAt: new Date(prd.updated_at || prd.created_at),
  }));

  // Calculate stats
  const stats = {
    totalProjects: prds.length,
    prdsCompleted: prds.filter(p => p.status === 'completed').length,
    launched: prds.filter(p => p.status === 'completed').length,
    timeSaved: prds.length * 8, // Estimate 8 hours saved per PRD
  };

  const dashboardUser = {
    name: user?.name || 'Guest',
    plan: (user?.plan || 'free') as 'free' | 'pro',
  };

  return (
    <>
      {/* Welcome Toast */}
      {showWelcome && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-green-800">Welcome to PromptPit!</p>
              <p className="text-sm text-green-600">You&apos;re signed in successfully.</p>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="text-green-400 hover:text-green-600 ml-2"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <DashboardHome
        user={dashboardUser}
        projects={projects}
        stats={stats}
      />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><span className="text-gray-400">Loading...</span></div>}>
      <DashboardPageContent />
    </Suspense>
  );
}
