// lib/supabase/auth.ts
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./server";

export type AdminContext = {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  user: {
    id: string;
    email: string | null;
  };
  profile: {
    id: string;
    email: string | null;
    is_admin: boolean;
  };
};

export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/admin/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,email,is_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.is_admin !== true) {
    redirect("/admin/login");
  }

  return {
    supabase,
    user: { id: user.id, email: user.email ?? null },
    profile: {
      id: profile.id,
      email: profile.email ?? user.email ?? null,
      is_admin: profile.is_admin,
    },
  };
}

export async function getOptionalAdmin(): Promise<{
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  user: { id: string; email: string | null } | null;
  profile: { id: string; email: string | null; is_admin: boolean } | null;
}> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,is_admin")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_admin !== true) {
    return { supabase, user: { id: user.id, email: user.email ?? null }, profile: null };
  }

  return {
    supabase,
    user: { id: user.id, email: user.email ?? null },
    profile,
  };
}
