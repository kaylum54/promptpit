/**
 * User Preferences Management
 * Updates user preference stats when debates complete
 */

import { createServiceRoleClient } from './supabase';
import { detectIntent, type IntentCategory } from './intent-detection';
import { mapModelNameToKey, type ModelKey } from './routing';
import type { JudgeVerdict } from './types';

interface DebateData {
  prompt: string;
  responses: Record<string, string>;
  verdict: JudgeVerdict;
}

/**
 * Updates user preference stats after a debate completes
 * This tracks which models win for different task categories
 */
export async function updatePreferencesFromDebate(
  userId: string,
  debate: DebateData
): Promise<void> {
  const supabase = createServiceRoleClient();

  try {
    // Detect the category from the original prompt
    const category = detectIntent(debate.prompt);

    // Get the winner from the verdict
    const winnerName = debate.verdict?.winner;
    if (!winnerName) {
      console.warn('No winner found in debate verdict');
      return;
    }

    // Map winner name to model key
    const winnerModel = mapModelNameToKey(winnerName);

    // Get all models that participated
    const participants = Object.keys(debate.responses).map((name) =>
      mapModelNameToKey(name)
    );

    // Remove duplicates
    const uniqueParticipants = Array.from(new Set(participants));

    // Update stats for each participant
    for (const model of uniqueParticipants) {
      const isWinner = model === winnerModel;

      // Use the upsert function we created
      const { error } = await supabase.rpc('upsert_preference_stat', {
        p_user_id: userId,
        p_category: category,
        p_model: model,
        p_wins: isWinner ? 1 : 0,
        p_total: 1,
      });

      if (error) {
        console.error(`Error updating preference stat for ${model}:`, error);
      }
    }

    console.log(
      `Updated preference stats for user ${userId}: ${category} debate won by ${winnerModel}`
    );
  } catch (error) {
    console.error('Error updating preferences from debate:', error);
  }
}

/**
 * Gets or creates user preferences record
 */
export async function getUserPreferences(userId: string): Promise<{
  writing_model: ModelKey;
  code_model: ModelKey;
  research_model: ModelKey;
  analysis_model: ModelKey;
  general_model: ModelKey;
} | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error fetching user preferences:', error);
    return null;
  }

  if (!data) {
    // Return defaults if no preferences exist
    return {
      writing_model: 'claude',
      code_model: 'gpt',
      research_model: 'gemini',
      analysis_model: 'claude',
      general_model: 'claude',
    };
  }

  return {
    writing_model: data.writing_model as ModelKey,
    code_model: data.code_model as ModelKey,
    research_model: data.research_model as ModelKey,
    analysis_model: data.analysis_model as ModelKey,
    general_model: data.general_model as ModelKey,
  };
}

/**
 * Updates user's default model preference for a category
 */
export async function updateUserPreference(
  userId: string,
  category: IntentCategory,
  model: ModelKey
): Promise<boolean> {
  const supabase = createServiceRoleClient();

  const columnMap: Record<IntentCategory, string> = {
    writing: 'writing_model',
    code: 'code_model',
    research: 'research_model',
    analysis: 'analysis_model',
    general: 'general_model',
  };

  const column = columnMap[category];
  if (!column) return false;

  // Upsert the preference
  const { error } = await supabase.from('user_preferences').upsert(
    {
      user_id: userId,
      [column]: model,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  );

  if (error) {
    console.error('Error updating user preference:', error);
    return false;
  }

  return true;
}

/**
 * Gets user's preference stats summary
 */
export async function getUserPreferenceStatsSummary(
  userId: string
): Promise<Record<IntentCategory, { model: ModelKey; winRate: number; total: number }[]>> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('user_preference_stats')
    .select('category, model, wins, total')
    .eq('user_id', userId)
    .order('category')
    .order('wins', { ascending: false });

  if (error) {
    console.error('Error fetching preference stats summary:', error);
    return {
      writing: [],
      code: [],
      research: [],
      analysis: [],
      general: [],
    };
  }

  // Group by category
  const summary: Record<IntentCategory, { model: ModelKey; winRate: number; total: number }[]> = {
    writing: [],
    code: [],
    research: [],
    analysis: [],
    general: [],
  };

  for (const stat of data || []) {
    const category = stat.category as IntentCategory;
    if (summary[category]) {
      summary[category].push({
        model: stat.model as ModelKey,
        winRate: stat.total > 0 ? (stat.wins / stat.total) * 100 : 0,
        total: stat.total,
      });
    }
  }

  return summary;
}

/**
 * Saves a quick response to the database
 */
export async function saveQuickResponse(data: {
  userId: string;
  prompt: string;
  category: IntentCategory;
  model: ModelKey;
  response: string;
}): Promise<string | null> {
  const supabase = createServiceRoleClient();

  const { data: result, error } = await supabase
    .from('quick_responses')
    .insert({
      user_id: data.userId,
      prompt: data.prompt,
      category: data.category,
      model: data.model,
      response: data.response,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error saving quick response:', error);
    return null;
  }

  return result?.id || null;
}

/**
 * Gets a quick response by ID
 */
export async function getQuickResponse(id: string): Promise<{
  id: string;
  user_id: string;
  prompt: string;
  category: IntentCategory;
  model: ModelKey;
  response: string;
  expanded_to_debate: boolean;
  debate_id: string | null;
} | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('quick_responses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching quick response:', error);
    return null;
  }

  return data as {
    id: string;
    user_id: string;
    prompt: string;
    category: IntentCategory;
    model: ModelKey;
    response: string;
    expanded_to_debate: boolean;
    debate_id: string | null;
  };
}

/**
 * Marks a quick response as expanded to debate
 */
export async function markQuickResponseExpanded(
  quickResponseId: string,
  debateId: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from('quick_responses')
    .update({
      expanded_to_debate: true,
      debate_id: debateId,
    })
    .eq('id', quickResponseId);

  if (error) {
    console.error('Error marking quick response as expanded:', error);
    return false;
  }

  return true;
}
