/**
 * lib/supabase/server.ts
 *
 * Server-side Supabase client for use in API Routes and Server Components.
 * Uses the same publishable key as the browser client since we rely on
 * Supabase RLS for authorization rather than service role bypass.
 */
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Returns a Supabase client safe for server-side use.
 * This client uses the publishable key (not service role key)
 * so RLS policies remain enforced.
 */
export async function getSupabaseServer(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error('[Supabase Server] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }

  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Returns a Supabase client with service role key for privileged operations
 * (webhook handlers, admin actions). Only use in server contexts.
 * Falls back to publishable key if no service role key is configured.
 */
export async function getSupabaseAdmin(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use service role if available, otherwise fall back to publishable (less privileged)
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error('[Supabase Admin] Missing Supabase URL or key');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
