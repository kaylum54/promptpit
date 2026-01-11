import { createBrowserClient, type SupabaseClient } from '@supabase/ssr'

// Re-export types from the main supabase file for convenience
export type { Database, Json } from './supabase'

// Singleton client instance
let supabaseClient: SupabaseClient | null = null

/**
 * Creates a Supabase client for use in the browser (Client Components).
 * This client uses the anon key and respects Row Level Security.
 *
 * Use this in 'use client' components instead of the main supabase.ts
 * to avoid importing server-only code (cookies from next/headers).
 *
 * Uses singleton pattern to prevent multiple client instances.
 */
export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return supabaseClient
}
