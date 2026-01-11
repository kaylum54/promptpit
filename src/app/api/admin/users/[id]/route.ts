import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin';

// GET single user with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: user, error } = await supabase
    .from('promptpit_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Get user's recent debates
  const { data: debates } = await supabase
    .from('debates')
    .select('id, prompt, verdict, created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Get total debate count
  const { count: totalDebates } = await supabase
    .from('debates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', id);

  return NextResponse.json({
    user,
    debates: debates || [],
    totalDebates: totalDebates || 0,
  });
}

// PUT update user (tier, role)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { tier, role } = body;

  // Prevent admin from removing their own admin role
  if (id === admin.userId && role === 'user') {
    return NextResponse.json(
      { error: 'Cannot remove your own admin role' },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();

  const updates: Record<string, string> = {};
  if (tier) updates.tier = tier;
  if (role) updates.role = role;

  const { data, error } = await supabase
    .from('promptpit_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;

  // Prevent admin from deleting themselves
  if (id === admin.userId) {
    return NextResponse.json(
      { error: 'Cannot delete your own account' },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from('promptpit_profiles')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
