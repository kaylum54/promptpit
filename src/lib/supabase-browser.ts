import { createBrowserClient } from '@supabase/ssr'

// Re-export types from the main supabase file for convenience
export type { Database, Json } from './supabase'

/**
 * Creates a Supabase client for use in the browser (Client Components).
 * This client uses the anon key and respects Row Level Security.
 *
 * Use this in 'use client' components instead of the main supabase.ts
 * to avoid importing server-only code (cookies from next/headers).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
