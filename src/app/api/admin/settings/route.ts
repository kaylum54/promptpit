import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';

// Default settings
const DEFAULTS = {
  guest_daily_limit: '3',
  free_monthly_limit: '15',
  pro_monthly_limit: '100',
  maintenance_mode: 'false',
};

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // For now, return default settings
  // In production, you'd fetch from a platform_config table
  return NextResponse.json({
    settings: DEFAULTS,
  });
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  
  // In production, you'd save to a platform_config table
  // For now, just return success
  return NextResponse.json({
    success: true,
    settings: { ...DEFAULTS, ...body },
  });
}
