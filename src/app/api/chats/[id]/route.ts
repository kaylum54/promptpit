import { NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';
import type { Chat, ChatMessage, ChatWithMessages } from '@/lib/types';

/**
 * GET /api/chats/[id]
 * Returns a chat with all its messages
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatId } = await params;
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Get chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', auth0User.sub)
      .single();

    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    const response: ChatWithMessages = {
      chat: chat as Chat,
      messages: (messages || []) as ChatMessage[],
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in GET /api/chats/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/chats/[id]
 * Updates a chat (title, archived status)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatId } = await params;
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: Partial<Chat> = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.archived !== undefined) updates.archived = body.archived;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Verify ownership and update
    const { data: chat, error: updateError } = await supabase
      .from('chats')
      .update(updates)
      .eq('id', chatId)
      .eq('user_id', auth0User.sub)
      .select()
      .single();

    if (updateError || !chat) {
      return NextResponse.json({ error: 'Chat not found or update failed' }, { status: 404 });
    }

    return NextResponse.json(chat as Chat);

  } catch (error) {
    console.error('Error in PATCH /api/chats/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/chats/[id]
 * Deletes a chat and all its messages
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatId } = await params;
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Verify ownership before delete
    const { data: chat } = await supabase
      .from('chats')
      .select('id')
      .eq('id', chatId)
      .eq('user_id', auth0User.sub)
      .single();

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Delete chat (messages will cascade delete due to FK constraint)
    const { error: deleteError } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (deleteError) {
      console.error('Error deleting chat:', deleteError);
      return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/chats/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
