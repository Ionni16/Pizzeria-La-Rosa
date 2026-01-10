"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function mustString(fd: FormData, key: string) {
  const v = fd.get(key);
  if (!v) throw new Error(`Missing field: ${key}`);
  const s = String(v).trim();
  if (!s) throw new Error(`Empty field: ${key}`);
  return s;
}

function optString(fd: FormData, key: string) {
  const v = fd.get(key);
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

function optNumber(fd: FormData, key: string) {
  const raw = optString(fd, key);
  if (raw == null) return null;
  const normalized = raw.replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

/**
 * CATEGORIES
 */
export async function createCategory(fd: FormData) {
  const supabase = await createSupabaseServerClient();

  const name_it = mustString(fd, "name_it");
  const name_en = mustString(fd, "name_en");
  const position = Number(mustString(fd, "position"));

  const { error } = await supabase.from("categories").insert({
    name_it,
    name_en,
    position,
    is_active: true,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/it");
  revalidatePath("/en");
  redirect("/admin/categories");
}

export async function updateCategory(fd: FormData) {
  const supabase = await createSupabaseServerClient();

  const id = mustString(fd, "id");
  const name_it = mustString(fd, "name_it");
  const name_en = mustString(fd, "name_en");
  const position = Number(mustString(fd, "position"));
  const is_active = mustString(fd, "is_active") === "true";

  const { error } = await supabase
    .from("categories")
    .update({ name_it, name_en, position, is_active })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/it");
  revalidatePath("/en");
  redirect("/admin/categories");
}

export async function deleteCategory(fd: FormData) {
  const supabase = await createSupabaseServerClient();

  const id = mustString(fd, "id");

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/it");
  revalidatePath("/en");
  redirect("/admin/categories");
}

/**
 * DISHES (legacy admin actions)
 * Nota: nel tuo progetto c'è anche l'admin "nuovo" in app/admin/(protected)/dishes.
 * Questo file resta compilabile e corretto, ma valuta di eliminarlo quando ripulisci l'admin legacy.
 */
export async function createDish(fd: FormData) {
  const supabase = await createSupabaseServerClient();

  const category_id = optString(fd, "category_id");
  const name_it = mustString(fd, "name_it");
  const name_en = mustString(fd, "name_en");
  const description_it = optString(fd, "description_it");
  const description_en = optString(fd, "description_en");
  const price_eur = optNumber(fd, "price_eur");
  const position = Number(mustString(fd, "position"));
  const is_available = mustString(fd, "is_available") === "true";
  const image_url = optString(fd, "image_url");

  const { error } = await supabase.from("dishes").insert({
    category_id,
    name_it,
    name_en,
    description_it,
    description_en,
    price_eur,
    position,
    is_available,
    image_url,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/dishes");
  revalidatePath("/it");
  revalidatePath("/en");
  redirect("/admin/dishes");
}

export async function updateDish(fd: FormData) {
  const supabase = await createSupabaseServerClient();

  const id = mustString(fd, "id");
  const category_id = optString(fd, "category_id");
  const name_it = mustString(fd, "name_it");
  const name_en = mustString(fd, "name_en");
  const description_it = optString(fd, "description_it");
  const description_en = optString(fd, "description_en");
  const price_eur = optNumber(fd, "price_eur");
  const position = Number(mustString(fd, "position"));
  const is_available = mustString(fd, "is_available") === "true";
  const image_url = optString(fd, "image_url");

  const { error } = await supabase
    .from("dishes")
    .update({
      category_id,
      name_it,
      name_en,
      description_it,
      description_en,
      price_eur,
      position,
      is_available,
      image_url,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/dishes");
  revalidatePath("/it");
  revalidatePath("/en");
  redirect("/admin/dishes");
}

export async function deleteDish(fd: FormData) {
  const supabase = await createSupabaseServerClient();

  const id = mustString(fd, "id");

  const { error } = await supabase.from("dishes").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/dishes");
  revalidatePath("/it");
  revalidatePath("/en");
  redirect("/admin/dishes");
}

/**
 * TAGS
 */
export async function createTag(fd: FormData) {
  const supabase = await createSupabaseServerClient();

  const label_it = mustString(fd, "label_it");
  const label_en = mustString(fd, "label_en");

  const { error } = await supabase.from("tags").insert({ label_it, label_en });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/tags");
  revalidatePath("/it");
  revalidatePath("/en");
  redirect("/admin/tags");
}

export async function deleteTag(fd: FormData) {
  const supabase = await createSupabaseServerClient();

  const id = mustString(fd, "id");
  const { error } = await supabase.from("tags").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/tags");
  revalidatePath("/it");
  revalidatePath("/en");
  redirect("/admin/tags");
}

/**
 * ALLERGENS
 */
export async function createAllergen(fd: FormData) {
  const supabase = await createSupabaseServerClient();

  const code = optString(fd, "code");
  const label_it = mustString(fd, "label_it");
  const label_en = mustString(fd, "label_en");

  const { error } = await supabase.from("allergens").insert({ code, label_it, label_en });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/allergens");
  revalidatePath("/it");
  revalidatePath("/en");
  redirect("/admin/allergens");
}

export async function deleteAllergen(fd: FormData) {
  const supabase = await createSupabaseServerClient();

  const id = mustString(fd, "id");
  const { error } = await supabase.from("allergens").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/allergens");
  revalidatePath("/it");
  revalidatePath("/en");
  redirect("/admin/allergens");
}
