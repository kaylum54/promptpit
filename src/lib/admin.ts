import { createServerSupabaseClient, createServiceRoleClient } from './supabase';

/**
 * Check if a user has admin role
 * @param userId - The user's UUID
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
 * Get the current user from the request and check if they're admin
 * Returns { userId, email } or null if not authenticated or not admin
 */
export async function requireAdmin(): Promise<{ userId: string; email: string } | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  const adminCheck = await isAdmin(user.id);
  if (!adminCheck) return null;

  return { userId: user.id, email: user.email || '' };
}

/**
 * Get user profile with admin check (uses service role to bypass RLS)
 * @param userId - The user's UUID
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
 * @param userId - The user's UUID
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
