import { NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { checkFreeTierLimit } from '@/lib/free-tier';

/**
 * GET /api/prd/limits
 *
 * Returns the user's PRD creation limits and usage.
 */
export async function GET() {
  try {
    const auth0User = await getAuth0User();

    const limits = await checkFreeTierLimit(auth0User?.sub || null);

    return NextResponse.json({
      canCreate: limits.canCreate,
      used: limits.used,
      limit: limits.limit === Infinity ? 'unlimited' : limits.limit,
      resetDate: limits.resetDate?.toISOString() || null,
      isLoggedIn: !!auth0User,
    });

  } catch (error) {
    console.error('Error in GET /api/prd/limits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
