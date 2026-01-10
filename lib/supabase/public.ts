// lib/supabase/public.ts
import { createServerClient } from "@supabase/ssr";

/**
 * Public server-side Supabase client (NO cookies).
 * Use for public pages to speed up and allow caching safely.
 */
export function createSupabasePublicServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // no-op
      },
    },
  });
}
