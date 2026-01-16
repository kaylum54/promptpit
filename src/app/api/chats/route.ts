import { NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';
import type { Chat, ChatListResponse } from '@/lib/types';

/**
 * GET /api/chats
 * Returns list of user's chats, ordered by most recent
 */
export async function GET(request: Request) {
  try {
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const archived = searchParams.get('archived') === 'true';

    const supabase = createServiceRoleClient();

    // Get chats with count
    const { data: chats, error: fetchError, count } = await supabase
      .from('chats')
      .select('*', { count: 'exact' })
      .eq('user_id', auth0User.sub)
      .eq('archived', archived)
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error('Error fetching chats:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
    }

    const response: ChatListResponse = {
      chats: (chats || []) as Chat[],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in GET /api/chats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/chats
 * Creates a new chat
 */
export async function POST(request: Request) {
  try {
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check Pro status
    const supabase = createServiceRoleClient();
    const { data: profile } = await supabase
      .from('promptpit_profiles')
      .select('tier, role')
      .eq('id', auth0User.sub)
      .single();

    const isPro = profile?.tier === 'pro' || profile?.role === 'admin';
    if (!isPro) {
      return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const title = body.title || 'New Chat';

    // Create chat
    const { data: chat, error: createError } = await supabase
      .from('chats')
      .insert({
        user_id: auth0User.sub,
        title,
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        archived: false,
        message_count: 0,
        primary_category: 'general',
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating chat:', createError);
      return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
    }

    return NextResponse.json(chat as Chat);

  } catch (error) {
    console.error('Error in POST /api/chats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
