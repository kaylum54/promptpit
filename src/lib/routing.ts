/**
 * AI Model Routing System
 * Determines the best model to use based on user's debate history
 */

import { createServiceRoleClient } from './supabase';
import type { IntentCategory } from './intent-detection';

export type ModelKey = 'claude' | 'gpt' | 'gemini' | 'llama';

export interface RoutingDecision {
  model: ModelKey;
  reason: string;
  confidence: number; // 0-100
  category: IntentCategory;
}

interface PreferenceStat {
  model: string;
  wins: number;
  total: number;
}

// Default model recommendations by category
const defaultModels: Record<IntentCategory, { model: ModelKey; reason: string }> = {
  writing: { model: 'claude', reason: 'Claude excels at writing and creative tasks' },
  code: { model: 'gpt', reason: 'GPT-4o is strong at code generation and debugging' },
  research: { model: 'gemini', reason: 'Gemini is fast and thorough for research' },
  analysis: { model: 'claude', reason: 'Claude provides nuanced analysis' },
  general: { model: 'claude', reason: 'Claude is your default model' },
};

// Model display names
export const modelDisplayNames: Record<ModelKey, string> = {
  claude: 'Claude',
  gpt: 'GPT-4o',
  gemini: 'Gemini',
  llama: 'Llama',
};

// Model colors (matching the app's color scheme)
export const modelColors: Record<ModelKey, string> = {
  claude: '#f59e0b',
  gpt: '#10b981',
  gemini: '#8b5cf6',
  llama: '#06b6d4',
};

/**
 * Gets user's preference stats for a specific category
 */
async function getUserPreferenceStats(
  userId: string,
  category: IntentCategory
): Promise<PreferenceStat[]> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('user_preference_stats')
    .select('model, wins, total')
    .eq('user_id', userId)
    .eq('category', category);

  if (error) {
    console.error('Error fetching preference stats:', error);
    return [];
  }

  return data || [];
}

/**
 * Gets the default routing decision for a category
 */
function getDefaultRouting(category: IntentCategory): RoutingDecision {
  const defaultInfo = defaultModels[category] || defaultModels.general;
  return {
    model: defaultInfo.model,
    reason: defaultInfo.reason,
    confidence: 50,
    category,
  };
}

/**
 * Determines the best model to use based on user's debate history
 */
export async function getRoutingDecision(
  userId: string,
  category: IntentCategory
): Promise<RoutingDecision> {
  // Get user's preference stats for this category
  const stats = await getUserPreferenceStats(userId, category);

  // If no history, use defaults
  if (!stats || stats.length === 0) {
    return getDefaultRouting(category);
  }

  // Calculate win rates
  const winRates = stats.map((s) => ({
    model: s.model as ModelKey,
    winRate: s.total > 0 ? (s.wins / s.total) * 100 : 0,
    total: s.total,
    wins: s.wins,
  }));

  // Sort by win rate (highest first), then by total debates as tiebreaker
  winRates.sort((a, b) => {
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    return b.total - a.total;
  });

  const best = winRates[0];

  // Need at least 3 debates to be confident in the data
  if (best.total < 3) {
    const defaultRouting = getDefaultRouting(category);
    return {
      ...defaultRouting,
      reason: `${defaultRouting.reason} (building your preference data)`,
      confidence: 40,
    };
  }

  // Calculate confidence based on number of debates and win rate differential
  let confidence = Math.min(best.total * 10, 80); // More debates = more confidence, cap at 80

  // Boost confidence if win rate is significantly higher than second place
  if (winRates.length > 1) {
    const secondBest = winRates[1];
    const differential = best.winRate - secondBest.winRate;
    if (differential > 20) confidence = Math.min(confidence + 15, 95);
    else if (differential > 10) confidence = Math.min(confidence + 10, 90);
  }

  const modelName = modelDisplayNames[best.model] || best.model;
  const winRateRounded = Math.round(best.winRate);

  return {
    model: best.model,
    reason: `${modelName} wins ${winRateRounded}% of your ${category} tasks`,
    confidence,
    category,
  };
}

/**
 * Gets routing decision for a user who may not have history yet
 * Falls back to smart defaults based on category
 */
export async function getRoutingDecisionWithFallback(
  userId: string | null,
  category: IntentCategory
): Promise<RoutingDecision> {
  if (!userId) {
    return getDefaultRouting(category);
  }

  return getRoutingDecision(userId, category);
}

/**
 * Maps a model display name to its key
 * e.g., "Claude" -> "claude", "GPT-4o" -> "gpt"
 */
export function mapModelNameToKey(name: string): ModelKey {
  const normalized = name.toLowerCase().trim();

  if (normalized.includes('claude')) return 'claude';
  if (normalized.includes('gpt') || normalized.includes('openai')) return 'gpt';
  if (normalized.includes('gemini') || normalized.includes('google')) return 'gemini';
  if (normalized.includes('llama') || normalized.includes('meta')) return 'llama';

  // Default fallback
  return 'claude';
}

/**
 * Gets the OpenRouter model ID for a model key
 */
export function getOpenRouterModelId(model: ModelKey): string {
  const modelIds: Record<ModelKey, string> = {
    claude: 'anthropic/claude-sonnet-4',
    gpt: 'openai/gpt-4o',
    gemini: 'google/gemini-2.0-flash-001',
    llama: 'meta-llama/llama-3.3-70b-instruct',
  };
  return modelIds[model];
}
