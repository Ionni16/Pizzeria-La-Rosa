// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client.
 * Importante: usa cookie (document.cookie) così la sessione è leggibile lato server.
 */
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
