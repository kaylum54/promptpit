'use client';

import { useState, useEffect } from 'react';
import type { ChatModelKey, IntentCategory } from '@/lib/types';

// Model display info
const MODEL_INFO: Record<ChatModelKey, { name: string; color: string; description: string }> = {
  claude: { name: 'Claude', color: '#f59e0b', description: 'Best for writing & nuanced reasoning' },
  gpt: { name: 'GPT-4o', color: '#10b981', description: 'Best for code & technical tasks' },
  gemini: { name: 'Gemini', color: '#8b5cf6', description: 'Best for research & speed' },
  llama: { name: 'Llama', color: '#06b6d4', description: 'Open-source alternative' },
};

const CATEGORIES: { key: IntentCategory; label: string; icon: string }[] = [
  { key: 'writing', label: 'Writing', icon: '✍️' },
  { key: 'code', label: 'Code', icon: '💻' },
  { key: 'research', label: 'Research', icon: '🔍' },
  { key: 'analysis', label: 'Analysis', icon: '📊' },
  { key: 'general', label: 'General', icon: '💬' },
];

interface PreferenceStat {
  category: IntentCategory;
  model: ChatModelKey;
  wins: number;
  total: number;
}

interface UserPreferences {
  writing_model: ChatModelKey | null;
  code_model: ChatModelKey | null;
  research_model: ChatModelKey | null;
  analysis_model: ChatModelKey | null;
  general_model: ChatModelKey | null;
}

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [stats, setStats] = useState<PreferenceStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/preferences');
      if (res.ok) {
        const data = await res.json();
        setPreferences(data.preferences || {});
        setStats(data.stats || []);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (category: IntentCategory, model: ChatModelKey | null) => {
    if (!preferences) return;

    const key = `${category}_model` as keyof UserPreferences;
    const newPreferences = { ...preferences, [key]: model };
    setPreferences(newPreferences);
    setIsSaving(true);

    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, model }),
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      // Revert on error
      setPreferences(preferences);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatsForCategory = (category: IntentCategory) => {
    return stats
      .filter((s) => s.category === category)
      .sort((a, b) => {
        const aRate = a.total > 0 ? a.wins / a.total : 0;
        const bRate = b.total > 0 ? b.wins / b.total : 0;
        return bRate - aRate;
      });
  };

  const getPreferredModel = (category: IntentCategory): ChatModelKey | null => {
    if (!preferences) return null;
    const key = `${category}_model` as keyof UserPreferences;
    return preferences[key];
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl tracking-wider text-black">
            MODEL PREFERENCES
          </h1>
          <p className="text-sm font-mono text-gray-500 mt-2">
            AI routing learns from your debates. Override defaults or let the system decide.
          </p>
        </div>

        {/* Preferences Grid */}
        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const categoryStats = getStatsForCategory(category.key);
            const preferredModel = getPreferredModel(category.key);
            const hasStats = categoryStats.length > 0;

            return (
              <div key={category.key} className="border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{category.icon}</span>
                  <h2 className="font-display text-xl tracking-wider text-black">
                    {category.label.toUpperCase()}
                  </h2>
                </div>

                {/* Stats from debates */}
                {hasStats && (
                  <div className="mb-4 p-4 bg-gray-100 border border-gray-200">
                    <p className="text-xs font-mono text-gray-400 mb-3">
                      {'// LEARNED FROM YOUR DEBATES'}
                    </p>
                    <div className="space-y-2">
                      {categoryStats.slice(0, 3).map((stat) => {
                        const winRate = stat.total > 0 ? Math.round((stat.wins / stat.total) * 100) : 0;
                        return (
                          <div key={stat.model} className="flex items-center gap-3">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: MODEL_INFO[stat.model]?.color }}
                            />
                            <span
                              className="text-sm font-mono"
                              style={{ color: MODEL_INFO[stat.model]?.color }}
                            >
                              {MODEL_INFO[stat.model]?.name}
                            </span>
                            <div className="flex-1 h-1 bg-gray-200">
                              <div
                                className="h-full transition-all"
                                style={{
                                  width: `${winRate}%`,
                                  backgroundColor: MODEL_INFO[stat.model]?.color,
                                }}
                              />
                            </div>
                            <span className="text-xs font-mono text-gray-400">
                              {winRate}% ({stat.wins}/{stat.total})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Model Selection */}
                <div className="space-y-2">
                  <p className="text-xs font-mono text-gray-400">
                    {'// SELECT PREFERRED MODEL'}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Auto option */}
                    <button
                      onClick={() => updatePreference(category.key, null)}
                      disabled={isSaving}
                      className={`p-3 border text-left transition-all ${
                        preferredModel === null
                          ? 'border-black bg-gray-100'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <p className="text-sm font-mono text-black">Auto</p>
                      <p className="text-xs font-mono text-gray-400 mt-1">
                        AI routing decides
                      </p>
                    </button>

                    {/* Model options */}
                    {(Object.keys(MODEL_INFO) as ChatModelKey[]).map((model) => (
                      <button
                        key={model}
                        onClick={() => updatePreference(category.key, model)}
                        disabled={isSaving}
                        className={`p-3 border text-left transition-all ${
                          preferredModel === model
                            ? 'border-black bg-gray-100'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <p
                          className="text-sm font-mono"
                          style={{ color: MODEL_INFO[model].color }}
                        >
                          {MODEL_INFO[model].name}
                        </p>
                        <p className="text-xs font-mono text-gray-400 mt-1 line-clamp-1">
                          {MODEL_INFO[model].description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div className="border border-gray-200 p-4 bg-white">
          <p className="text-xs font-mono text-gray-400">
            {'// HOW AI ROUTING WORKS'}
          </p>
          <p className="text-sm font-mono text-gray-500 mt-2">
            When set to &quot;Auto&quot;, the system analyzes your prompt and checks your debate history.
            If you&apos;ve run debates in a category, it routes to the model that wins most often for you.
            Override by selecting a specific model for any category.
          </p>
        </div>
      </div>
    </div>
  );
}
