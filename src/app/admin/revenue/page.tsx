'use client';

import { useState, useEffect } from 'react';

interface Subscriber {
  id: string;
  email: string | null;
  tier: string;
  stripe_customer_id: string | null;
  created_at: string;
}

interface RevenueData {
  kpis: { mrr: number; activeSubscriptions: number; newThisMonth: number; };
  subscribers: Subscriber[];
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/revenue')
      .then(res => res.json())
      .then(json => setData(json))
      .finally(() => setLoading(false));
  }, []);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Revenue Dashboard</h1>
        <div className="grid grid-cols-3 gap-4">
          {[0,1,2].map(i => (
            <div key={i} className="bg-bg-surface border border-border-DEFAULT rounded-lg p-4 animate-pulse">
              <div className="h-4 w-20 bg-bg-elevated rounded mb-2" />
              <div className="h-8 w-16 bg-bg-elevated rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Revenue Dashboard</h1>
        <p className="text-text-secondary">Track subscriptions and revenue</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-bg-surface border border-border-DEFAULT rounded-lg p-4">
          <p className="text-text-secondary text-sm">MRR</p>
          <p className="text-3xl font-bold text-green-400">${data?.kpis.mrr || 0}</p>
        </div>
        <div className="bg-bg-surface border border-border-DEFAULT rounded-lg p-4">
          <p className="text-text-secondary text-sm">Active Subscriptions</p>
          <p className="text-3xl font-bold text-text-primary">{data?.kpis.activeSubscriptions || 0}</p>
        </div>
        <div className="bg-bg-surface border border-border-DEFAULT rounded-lg p-4">
          <p className="text-text-secondary text-sm">New This Month</p>
          <p className="text-3xl font-bold text-blue-400">{data?.kpis.newThisMonth || 0}</p>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-DEFAULT rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border-DEFAULT">
          <h2 className="font-semibold text-text-primary">Pro Subscribers</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-DEFAULT bg-bg-elevated">
              <th className="text-left px-4 py-3 text-text-secondary text-sm">Email</th>
              <th className="text-left px-4 py-3 text-text-secondary text-sm">Subscribed</th>
              <th className="text-left px-4 py-3 text-text-secondary text-sm">Stripe</th>
            </tr>
          </thead>
          <tbody>
            {!data?.subscribers?.length ? (
              <tr>
                <td colSpan={3} className="px-4 py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-text-secondary font-medium mb-1">No Pro subscribers yet</p>
                    <p className="text-text-muted text-sm">Pro subscribers will appear here when users upgrade</p>
                  </div>
                </td>
              </tr>
            ) : data.subscribers.map((sub) => (
              <tr key={sub.id} className="border-b border-border-subtle hover:bg-bg-elevated/50">
                <td className="px-4 py-3 text-text-primary">{sub.email || 'Unknown'}</td>
                <td className="px-4 py-3 text-text-secondary text-sm">{formatDate(sub.created_at)}</td>
                <td className="px-4 py-3">
                  {sub.stripe_customer_id ? (
                    <a href={'https://dashboard.stripe.com/customers/' + sub.stripe_customer_id}
                      target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">View</a>
                  ) : <span className="text-text-muted">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
