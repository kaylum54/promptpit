'use client';

import { useState, useEffect } from 'react';
import type { ChatModelKey, IntentCategory } from '@/lib/types';

// Model display info
const MODEL_INFO: Record<ChatModelKey, { name: string; color: string }> = {
  claude: { name: 'Claude', color: '#f59e0b' },
  gpt: { name: 'GPT-4o', color: '#10b981' },
  gemini: { name: 'Gemini', color: '#8b5cf6' },
  llama: { name: 'Llama', color: '#06b6d4' },
};

const CATEGORY_LABELS: Record<IntentCategory, string> = {
  writing: 'Writing',
  code: 'Code',
  research: 'Research',
  analysis: 'Analysis',
  general: 'General',
};

interface InsightsData {
  totalChats: number;
  totalMessages: number;
  modelUsage: { model: ChatModelKey; count: number }[];
  categoryUsage: { category: IntentCategory; count: number }[];
  debateStats: {
    total: number;
    thisMonth: number;
    modelWins: { model: ChatModelKey; wins: number }[];
  };
  recentActivity: {
    date: string;
    chats: number;
    messages: number;
  }[];
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await fetch('/api/insights');
      if (res.ok) {
        const insights = await res.json();
        setData(insights);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm font-mono text-gray-400">Failed to load insights</p>
      </div>
    );
  }

  const totalModelUsage = data.modelUsage.reduce((sum, m) => sum + m.count, 0);
  const totalCategoryUsage = data.categoryUsage.reduce((sum, c) => sum + c.count, 0);
  const totalDebateWins = data.debateStats.modelWins.reduce((sum, m) => sum + m.wins, 0);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl tracking-wider text-black">
            USAGE INSIGHTS
          </h1>
          <p className="text-sm font-mono text-gray-500 mt-2">
            Track your AI usage patterns and model performance
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Chats" value={data.totalChats} />
          <StatCard label="Total Messages" value={data.totalMessages} />
          <StatCard label="Debates Run" value={data.debateStats.total} />
          <StatCard label="This Month" value={data.debateStats.thisMonth} />
        </div>

        {/* Model Usage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Mode Model Usage */}
          <div className="border border-gray-200 bg-white p-6">
            <p className="text-xs font-mono text-gray-400 mb-4">
              {'// QUICK MODE MODEL USAGE'}
            </p>
            {data.modelUsage.length === 0 ? (
              <p className="text-sm font-mono text-gray-500">No data yet</p>
            ) : (
              <div className="space-y-4">
                {data.modelUsage.map((usage) => {
                  const percentage = totalModelUsage > 0 ? Math.round((usage.count / totalModelUsage) * 100) : 0;
                  return (
                    <div key={usage.model} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm font-mono"
                          style={{ color: MODEL_INFO[usage.model]?.color }}
                        >
                          {MODEL_INFO[usage.model]?.name || usage.model}
                        </span>
                        <span className="text-xs font-mono text-gray-400">
                          {usage.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: MODEL_INFO[usage.model]?.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Debate Wins by Model */}
          <div className="border border-gray-200 bg-white p-6">
            <p className="text-xs font-mono text-gray-400 mb-4">
              {'// DEBATE WINS BY MODEL'}
            </p>
            {data.debateStats.modelWins.length === 0 ? (
              <p className="text-sm font-mono text-gray-500">No debates yet</p>
            ) : (
              <div className="space-y-4">
                {data.debateStats.modelWins.map((stat) => {
                  const percentage = totalDebateWins > 0 ? Math.round((stat.wins / totalDebateWins) * 100) : 0;
                  return (
                    <div key={stat.model} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm font-mono"
                          style={{ color: MODEL_INFO[stat.model]?.color }}
                        >
                          {MODEL_INFO[stat.model]?.name || stat.model}
                        </span>
                        <span className="text-xs font-mono text-gray-400">
                          {stat.wins} wins ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: MODEL_INFO[stat.model]?.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Category Usage */}
        <div className="border border-gray-200 bg-white p-6">
          <p className="text-xs font-mono text-gray-400 mb-4">
            {'// USAGE BY CATEGORY'}
          </p>
          {data.categoryUsage.length === 0 ? (
            <p className="text-sm font-mono text-gray-500">No data yet</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {data.categoryUsage.map((usage) => {
                const percentage = totalCategoryUsage > 0 ? Math.round((usage.count / totalCategoryUsage) * 100) : 0;
                return (
                  <div key={usage.category} className="text-center p-4 bg-gray-100 border border-gray-200">
                    <p className="text-2xl mb-2">
                      {usage.category === 'writing' && '✍️'}
                      {usage.category === 'code' && '💻'}
                      {usage.category === 'research' && '🔍'}
                      {usage.category === 'analysis' && '📊'}
                      {usage.category === 'general' && '💬'}
                    </p>
                    <p className="text-sm font-mono text-black">
                      {CATEGORY_LABELS[usage.category]}
                    </p>
                    <p className="text-xs font-mono text-gray-400 mt-1">
                      {usage.count} ({percentage}%)
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="border border-gray-200 bg-white p-6">
          <p className="text-xs font-mono text-gray-400 mb-4">
            {'// RECENT ACTIVITY (LAST 7 DAYS)'}
          </p>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm font-mono text-gray-500">No recent activity</p>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {data.recentActivity.map((day) => {
                const maxMessages = Math.max(...data.recentActivity.map((d) => d.messages), 1);
                const height = Math.max(20, (day.messages / maxMessages) * 100);
                return (
                  <div key={day.date} className="text-center">
                    <div className="h-24 flex items-end justify-center mb-2">
                      <div
                        className="w-full max-w-[40px] bg-black transition-all"
                        style={{ height: `${height}%` }}
                        title={`${day.messages} messages`}
                      />
                    </div>
                    <p className="text-xs font-mono text-gray-400">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-xs font-mono text-gray-500">
                      {day.messages}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-gray-200 bg-white p-4">
      <p className="text-xs font-mono text-gray-400 mb-2">{label}</p>
      <p className="font-display text-3xl text-black">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
