"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";

function mustText(v: FormDataEntryValue | null, fieldName: string) {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`Campo obbligatorio: ${fieldName}`);
  return s;
}

export async function createTagAction(formData: FormData) {
  const { supabase } = await requireAdmin();

  const label_it = mustText(formData.get("label_it"), "label_it");
  const label_en = mustText(formData.get("label_en"), "label_en");

  const { data, error } = await supabase
    .from("tags")
    .insert({ label_it, label_en })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/tags");
  redirect(`/admin/tags/${data.id}?saved=1`);
}

export async function updateTagAction(tagId: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const label_it = mustText(formData.get("label_it"), "label_it");
  const label_en = mustText(formData.get("label_en"), "label_en");

  const { error } = await supabase
    .from("tags")
    .update({ label_it, label_en })
    .eq("id", tagId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/tags");
  redirect(`/admin/tags/${tagId}?saved=1`);
}

export async function deleteTagAction(tagId: string) {
  const { supabase } = await requireAdmin();

  // cancella join piatti-tag
  await supabase.from("dish_tags").delete().eq("tag_id", tagId);

  const { error } = await supabase.from("tags").delete().eq("id", tagId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/tags");
  redirect("/admin/tags");
}
