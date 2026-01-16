/**
 * Activity logging helper
 * Use this to log user activities from anywhere in the app
 */

import { SupabaseClient } from '@supabase/supabase-js';

export type ActivityType =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'commented'
  | 'exported'
  | 'shared'
  | 'archived'
  | 'debate'
  | 'chat';

export type EntityType = 'prd' | 'debate' | 'chat' | 'team';

export interface LogActivityParams {
  activity_type: ActivityType;
  entity_type?: EntityType;
  entity_id?: string;
  entity_name?: string;
  details?: string;
  old_value?: string;
  new_value?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an activity to the activity log
 * Call this from server-side code (API routes, server actions)
 */
export async function logActivity(
  supabase: SupabaseClient,
  userId: string,
  params: LogActivityParams
): Promise<void> {
  try {
    const { error } = await supabase
      .from('promptpit_activity_log')
      .insert({
        user_id: userId,
        activity_type: params.activity_type,
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        entity_name: params.entity_name,
        details: params.details,
        old_value: params.old_value,
        new_value: params.new_value,
        metadata: params.metadata || {},
      });

    if (error) {
      console.error('Failed to log activity:', error);
    }
  } catch (error) {
    console.error('Error in logActivity:', error);
  }
}

/**
 * Log PRD-related activities
 */
export async function logPRDActivity(
  supabase: SupabaseClient,
  userId: string,
  prdId: string,
  prdName: string,
  type: 'created' | 'updated' | 'status_changed' | 'exported' | 'shared' | 'archived',
  options?: {
    details?: string;
    old_value?: string;
    new_value?: string;
  }
): Promise<void> {
  await logActivity(supabase, userId, {
    activity_type: type,
    entity_type: 'prd',
    entity_id: prdId,
    entity_name: prdName,
    details: options?.details,
    old_value: options?.old_value,
    new_value: options?.new_value,
  });
}

/**
 * Log debate-related activities
 */
export async function logDebateActivity(
  supabase: SupabaseClient,
  userId: string,
  debateId: string,
  prompt: string
): Promise<void> {
  await logActivity(supabase, userId, {
    activity_type: 'debate',
    entity_type: 'debate',
    entity_id: debateId,
    entity_name: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt,
    details: 'Started a new debate',
  });
}

/**
 * Log chat-related activities
 */
export async function logChatActivity(
  supabase: SupabaseClient,
  userId: string,
  chatId: string,
  chatTitle: string,
  type: 'created' | 'archived'
): Promise<void> {
  await logActivity(supabase, userId, {
    activity_type: type === 'created' ? 'chat' : 'archived',
    entity_type: 'chat',
    entity_id: chatId,
    entity_name: chatTitle,
    details: type === 'created' ? 'Started a new chat' : 'Archived chat',
  });
}
