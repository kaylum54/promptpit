'use client';

import { useAuth } from '@/hooks/useAuth';
import { AdminBlueprint } from '@/components/dashboard/tools/AdminBlueprint';

export default function AdminBlueprintPage() {
  const { profile, isLoading } = useAuth();

  const isPro = profile?.tier === 'pro' || profile?.role === 'admin';

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Upgrade prompt for non-pro users
  if (!isPro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro Feature</h2>
          <p className="text-gray-600 mb-6">
            Admin Blueprint is available on the Pro plan. Upgrade to generate complete admin panels
            tailored to your project&apos;s tech stack.
          </p>
          <a
            href="/pricing"
            className="inline-block bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
          >
            Upgrade to Pro
          </a>
        </div>
      </div>
    );
  }

  return <AdminBlueprint />;
}
