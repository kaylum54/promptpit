import { NextRequest, NextResponse } from 'next/server';
import { createPortalSession } from '@/lib/stripe';
import { getAuth0User, getUserProfile } from '@/lib/auth0';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated Auth0 user
    const auth0User = await getAuth0User();

    if (!auth0User) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user profile with stripe_customer_id
    const profile = await getUserProfile(auth0User.sub);

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe first.' },
        { status: 404 }
      );
    }

    // Get base URL for return URL
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create portal session
    const session = await createPortalSession({
      customerId: profile.stripe_customer_id,
      returnUrl: `${origin}/dashboard/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
