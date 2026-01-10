"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";

function mustText(v: FormDataEntryValue | null, fieldName: string) {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`Campo obbligatorio: ${fieldName}`);
  return s;
}
function optText(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export async function createAllergenAction(formData: FormData) {
  const { supabase } = await requireAdmin();

  const code = optText(formData.get("code")); // opzionale ma UNIQUE
  const label_it = mustText(formData.get("label_it"), "label_it");
  const label_en = mustText(formData.get("label_en"), "label_en");

  const { data, error } = await supabase
    .from("allergens")
    .insert({ code, label_it, label_en })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/allergens");
  redirect(`/admin/allergens/${data.id}?saved=1`);
}

export async function updateAllergenAction(allergenId: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const code = optText(formData.get("code"));
  const label_it = mustText(formData.get("label_it"), "label_it");
  const label_en = mustText(formData.get("label_en"), "label_en");

  const { error } = await supabase
    .from("allergens")
    .update({ code, label_it, label_en })
    .eq("id", allergenId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/allergens");
  redirect(`/admin/allergens/${allergenId}?saved=1`);
}

export async function deleteAllergenAction(allergenId: string) {
  const { supabase } = await requireAdmin();

  await supabase.from("dish_allergens").delete().eq("allergen_id", allergenId);

  const { error } = await supabase.from("allergens").delete().eq("id", allergenId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/allergens");
  redirect("/admin/allergens");
}
