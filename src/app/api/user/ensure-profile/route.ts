import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User, ensureUserProfile } from '@/lib/auth0';
import type { PromptPitProfile } from '@/lib/types';

/**
 * POST /api/user/ensure-profile
 *
 * Creates a profile for the authenticated user if it doesn't exist.
 * Returns the user's profile data.
 *
 * Can also be called with userId, email, name, picture in body
 * (used by Auth0 callback).
 */
export async function POST(request: NextRequest) {
  try {
    // Check if this is a callback from Auth0 with body data
    let userId: string | undefined;
    let email: string | undefined;
    let name: string | undefined;
    let picture: string | undefined;

    try {
      const body = await request.json();
      userId = body.userId;
      email = body.email;
      name = body.name;
      picture = body.picture;
    } catch {
      // No body, get from session
    }

    // If no userId in body, get from Auth0 session
    if (!userId) {
      const auth0User = await getAuth0User();
      if (!auth0User) {
        return NextResponse.json(
          { error: 'Unauthorized - please sign in' },
          { status: 401 }
        );
      }
      userId = auth0User.sub;
      email = auth0User.email;
      name = auth0User.name;
      picture = auth0User.picture;
    }

    // Ensure profile exists
    const profile = await ensureUserProfile(userId, email, name, picture);

    if (!profile) {
      return NextResponse.json(
        { error: 'Failed to create or fetch profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      profile: profile as PromptPitProfile,
      created: true,
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/user/ensure-profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
