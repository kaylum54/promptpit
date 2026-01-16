import { NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';
import type { IntentCategory, ChatModelKey } from '@/lib/types';

/**
 * GET /api/preferences
 * Returns user's model preferences and preference stats
 */
export async function GET() {
  try {
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Get user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', auth0User.sub)
      .single();

    // Get preference stats
    const { data: stats } = await supabase
      .from('user_preference_stats')
      .select('*')
      .eq('user_id', auth0User.sub);

    return NextResponse.json({
      preferences: preferences || {
        writing_model: null,
        code_model: null,
        research_model: null,
        analysis_model: null,
        general_model: null,
      },
      stats: (stats || []).map((s: { category: string; model: string; wins: number; total: number }) => ({
        category: s.category as IntentCategory,
        model: s.model as ChatModelKey,
        wins: s.wins,
        total: s.total,
      })),
    });

  } catch (error) {
    console.error('Error in GET /api/preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/preferences
 * Updates a single category preference
 */
export async function POST(request: Request) {
  try {
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category, model } = body as { category: IntentCategory; model: ChatModelKey | null };

    if (!category) {
      return NextResponse.json({ error: 'Category required' }, { status: 400 });
    }

    const validCategories: IntentCategory[] = ['writing', 'code', 'research', 'analysis', 'general'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Build update object
    const updateKey = `${category}_model`;
    const updateData = {
      user_id: auth0User.sub,
      [updateKey]: model,
      updated_at: new Date().toISOString(),
    };

    // Upsert preference
    const { error: upsertError } = await supabase
      .from('user_preferences')
      .upsert(updateData, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('Error updating preference:', upsertError);
      return NextResponse.json({ error: 'Failed to update preference' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in POST /api/preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
