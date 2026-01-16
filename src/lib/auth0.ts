import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { createServiceRoleClient, type Database } from './supabase';

// Extract domain from issuer URL (remove https:// prefix if present)
const issuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL || '';
const domain = issuerBaseUrl.replace(/^https?:\/\//, '');

// Create the Auth0 client instance with explicit configuration
// This avoids issues with environment variable auto-detection in edge runtime
export const auth0 = new Auth0Client({
  domain: domain,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  appBaseUrl: process.env.AUTH0_BASE_URL!,
  secret: process.env.AUTH0_SECRET!,
  authorizationParameters: {
    scope: 'openid profile email',
  },
});

export type Auth0User = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  nickname?: string;
  picture?: string;
  updated_at?: string;
};

export type UserProfile = Database['public']['Tables']['promptpit_profiles']['Row'];

/**
 * Get the Auth0 user from the session (server-side).
 * Returns null if not authenticated.
 */
export async function getAuth0User(): Promise<Auth0User | null> {
  try {
    const session = await auth0.getSession();
    return session?.user as Auth0User | null;
  } catch (error) {
    console.error('Error getting Auth0 session:', error);
    return null;
  }
}

/**
 * Require Auth0 authentication. Throws if not authenticated.
 */
export async function requireAuth0User(): Promise<Auth0User> {
  const user = await getAuth0User();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Ensure user profile exists in Supabase.
 * Creates one if it doesn't exist, returns existing if it does.
 */
export async function ensureUserProfile(
  userId: string,
  email?: string | null
): Promise<UserProfile | null> {
  const supabase = createServiceRoleClient();

  // Check if profile exists
  const { data: existingProfile, error: fetchError } = await supabase
    .from('promptpit_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching profile:', fetchError);
    return null;
  }

  if (existingProfile) {
    return existingProfile;
  }

  // Create new profile
  const now = new Date();
  const monthResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  const { data: newProfile, error: insertError } = await supabase
    .from('promptpit_profiles')
    .insert({
      id: userId,
      email: email || null,
      tier: 'free',
      stripe_customer_id: null,
      stripe_subscription_id: null,
      debates_this_month: 0,
      month_reset_date: monthResetDate,
      role: null,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating profile:', insertError);
    return null;
  }

  return newProfile;
}

/**
 * Get user profile from Supabase by Auth0 user ID.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('promptpit_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching user profile:', error);
    }
    return null;
  }

  return data;
}

/**
 * Get Auth0 user and their profile in one call.
 * Returns null values if not authenticated.
 */
export async function getAuth0UserWithProfile(): Promise<{
  user: Auth0User | null;
  profile: UserProfile | null;
}> {
  const user = await getAuth0User();
  if (!user) {
    return { user: null, profile: null };
  }

  const profile = await getUserProfile(user.sub);
  return { user, profile };
}

/**
 * Check if user has Pro tier or admin role.
 */
export async function isPro(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;
  return profile.tier === 'pro' || profile.role === 'admin';
}

/**
 * Check if user has admin role.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;
  return profile.role === 'admin';
}
