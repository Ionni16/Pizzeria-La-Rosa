"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";

export async function signOutAction() {
  // usa il client server già configurato con i cookie
  const { supabase } = await requireAdmin();

  const { error } = await supabase.auth.signOut();
  if (error) {
    // non blocchiamo il logout per un errore: redirect comunque
    // (ma se vuoi puoi throware)
  }

  redirect("/admin/login");
}
