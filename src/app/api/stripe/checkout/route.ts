import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, type PlanId } from '@/lib/stripe';
import { getAuth0User } from '@/lib/auth0';

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

    // Parse request body
    const body = await request.json();
    const { planId } = body as { planId?: string };

    if (!planId || (planId !== 'pro')) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Get base URL for redirect URLs
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create checkout session
    const session = await createCheckoutSession({
      userId: auth0User.sub,
      userEmail: auth0User.email!,
      planId: planId as PlanId,
      successUrl: `${origin}/?checkout=success`,
      cancelUrl: `${origin}/?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
