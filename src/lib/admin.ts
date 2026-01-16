import { getAuth0User } from './auth0';
import { createServiceRoleClient } from './supabase';

/**
 * Check if a user has admin role
 * @param userId - The user's Auth0 sub ID
 * @returns Promise<boolean> - True if user is admin, false otherwise
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const adminClient = createServiceRoleClient();
  const { data, error } = await adminClient
    .from('promptpit_profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) return false;
  return data.role === 'admin';
}

/**
 * Get the current user from Auth0 session and check if they're admin
 * Returns { userId, email } or null if not authenticated or not admin
 */
export async function requireAdmin(): Promise<{ userId: string; email: string } | null> {
  const auth0User = await getAuth0User();

  if (!auth0User) return null;

  const adminCheck = await isAdmin(auth0User.sub);
  if (!adminCheck) return null;

  return { userId: auth0User.sub, email: auth0User.email || '' };
}

/**
 * Get user profile with admin check (uses service role to bypass RLS)
 * @param userId - The user's Auth0 sub ID
 * @returns The profile data and any error
 */
export async function getAdminProfile(userId: string) {
  const adminClient = createServiceRoleClient();
  const { data, error } = await adminClient
    .from('promptpit_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

/**
 * Helper to check if user should bypass usage limits (admin or pro)
 * @param userId - The user's Auth0 sub ID
 * @returns Promise<boolean> - True if user can bypass limits (admin only currently)
 */
export async function shouldBypassLimits(userId: string): Promise<boolean> {
  const adminClient = createServiceRoleClient();
  const { data, error } = await adminClient
    .from('promptpit_profiles')
    .select('role, tier')
    .eq('id', userId)
    .single();

  if (error || !data) return false;

  // Admins always bypass limits
  if (data.role === 'admin') return true;

  // Pro users have higher limits but don't fully bypass
  return false;
}
