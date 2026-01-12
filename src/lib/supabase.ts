import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Types for Supabase database
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      debates: {
        Row: {
          id: string
          user_id: string | null
          prompt: string
          responses: Json
          scores: Json | null
          verdict: Json | null
          latencies: Json | null
          created_at: string
          is_multi_round: boolean | null
          rounds: Json | null
          total_rounds: number | null
          arena: string | null  // 'debate' | 'code' | 'writing'
        }
        Insert: {
          id?: string
          user_id?: string | null
          prompt: string
          responses: Json
          scores?: Json | null
          verdict?: Json | null
          latencies?: Json | null
          created_at?: string
          is_multi_round?: boolean | null
          rounds?: Json | null
          total_rounds?: number | null
          arena?: string | null  // 'debate' | 'code' | 'writing'
        }
        Update: {
          id?: string
          user_id?: string | null
          prompt?: string
          responses?: Json
          scores?: Json | null
          verdict?: Json | null
          latencies?: Json | null
          created_at?: string
          is_multi_round?: boolean | null
          rounds?: Json | null
          total_rounds?: number | null
          arena?: string | null  // 'debate' | 'code' | 'writing'
        }
      }
      users: {
        Row: {
          id: string
          email: string | null
          debates_today: number
          last_debate_date: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          debates_today?: number
          last_debate_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          debates_today?: number
          last_debate_date?: string | null
          created_at?: string
        }
      }
      promptpit_profiles: {
        Row: {
          id: string
          email: string | null
          tier: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          debates_this_month: number
          month_reset_date: string
          created_at: string
          role: string | null
        }
        Insert: {
          id: string
          email?: string | null
          tier?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          debates_this_month?: number
          month_reset_date?: string
          created_at?: string
          role?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          tier?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          debates_this_month?: number
          month_reset_date?: string
          created_at?: string
          role?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

/**
 * Creates a Supabase client for use in the browser (Client Components).
 * This client uses the anon key and respects Row Level Security.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Creates a Supabase client for use in Server Components, Server Actions, and Route Handlers.
 * This client handles cookie management for auth sessions.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The \`setAll\` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

/**
 * Creates a Supabase admin client with service role privileges.
 * WARNING: This bypasses Row Level Security. Only use in secure server-side contexts.
 * Never expose the service role key to the client.
 */
export function createServiceRoleClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@supabase/supabase-js')

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
