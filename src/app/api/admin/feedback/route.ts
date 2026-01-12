import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin';

// Feedback row type
interface FeedbackRow {
  id: string;
  user_id: string | null;
  email: string | null;
  category: string | null;
  message: string;
  page_url: string | null;
  user_agent: string | null;
  status: string;
  created_at: string;
}

/**
 * GET /api/admin/feedback - List all feedback with optional filters
 */
export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') || '';

  const supabase = createServiceRoleClient();
  const offset = (page - 1) * limit;

  // Build count query
  let countQuery = supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true });

  if (status && status !== 'all') {
    countQuery = countQuery.eq('status', status);
  }

  const { count } = await countQuery;

  // Build data query - sort by newest first
  let dataQuery = supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all') {
    dataQuery = dataQuery.eq('status', status);
  }

  const { data: feedback, error } = await dataQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    feedback: feedback as FeedbackRow[],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}

/**
 * PATCH /api/admin/feedback - Update feedback status
 */
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }

    if (!status || !['new', 'reviewed', 'resolved'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (new, reviewed, resolved)' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ feedback: data });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

/**
 * DELETE /api/admin/feedback - Delete feedback
 */
export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
