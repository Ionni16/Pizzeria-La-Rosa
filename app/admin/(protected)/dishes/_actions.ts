"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";
import { getStoragePathFromPublicUrl, DISH_BUCKET } from "@/lib/supabase/storage";
import type { SupabaseClient } from "@supabase/supabase-js";

function toText(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}
function toNumber(v: FormDataEntryValue | null, fallback = 0) {
  const n = Number(String(v ?? "").replace(",", ".").trim());
  return Number.isFinite(n) ? n : fallback;
}
function toInt(v: FormDataEntryValue | null, fallback = 0) {
  const n = Math.trunc(toNumber(v, fallback));
  return n;
}
function toNullableInt(v: FormDataEntryValue | null) {
  const raw = String(v ?? "").trim();
  if (!raw) return null;
  const n = Math.trunc(Number(raw.replace(",", ".")));
  return Number.isFinite(n) ? n : null;
}
function toBool(v: FormDataEntryValue | null) {
  return v === "on" || v === "true";
}
function getIds(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((x) => String(x))
    .filter(Boolean);
}

/**
 * Revalida sia le pagine admin che le pagine pubbliche del menu.
 * FIX Bug 1: /it e /en sono le pagine pubbliche, NON solo "/"
 */
function revalidateAll(dishId?: string) {
  revalidatePath("/admin/dishes");
  if (dishId) revalidatePath(`/admin/dishes/${dishId}`);
  revalidatePath("/it");
  revalidatePath("/en");
}

/**
 * Cancella un'immagine da Supabase Storage se l'URL è del nostro bucket.
 * FIX Bug 3: pulizia immagini orfane.
 * Non lancia errori: la cancellazione storage è best-effort.
 */
async function tryDeleteStorageImage(
  supabase: SupabaseClient,
  imageUrl: string | null | undefined
) {
  if (!imageUrl) return;
  const path = getStoragePathFromPublicUrl(imageUrl);
  if (!path) return;
  await supabase.storage.from(DISH_BUCKET).remove([path]);
}

/**
 * Aggiorna i join dish_tags e dish_allergens.
 * FIX Bug 2: controlla l'errore del delete prima di procedere.
 * FIX Bug 5: riceve il client già autenticato invece di chiamare requireAdmin() di nuovo.
 */
async function upsertDishJoins(
  supabase: SupabaseClient,
  dishId: string,
  tagIds: string[],
  allergenIds: string[]
) {
  // FIX Bug 2: verifica l'errore del delete — se fallisce, non procedere con l'insert
  const { error: delTagsErr } = await supabase
    .from("dish_tags")
    .delete()
    .eq("dish_id", dishId);
  if (delTagsErr) throw new Error(`Errore rimozione tag: ${delTagsErr.message}`);

  if (tagIds.length) {
    const rows = tagIds.map((tag_id) => ({ dish_id: dishId, tag_id }));
    const { error } = await supabase.from("dish_tags").insert(rows);
    if (error) throw new Error(`Errore inserimento tag: ${error.message}`);
  }

  const { error: delAllerErr } = await supabase
    .from("dish_allergens")
    .delete()
    .eq("dish_id", dishId);
  if (delAllerErr) throw new Error(`Errore rimozione allergeni: ${delAllerErr.message}`);

  if (allergenIds.length) {
    const rows = allergenIds.map((allergen_id) => ({ dish_id: dishId, allergen_id }));
    const { error } = await supabase.from("dish_allergens").insert(rows);
    if (error) throw new Error(`Errore inserimento allergeni: ${error.message}`);
  }
}

export async function createDishAction(formData: FormData) {
  const { supabase } = await requireAdmin(); // FIX Bug 5: un solo requireAdmin()

  const category_id = String(formData.get("category_id") ?? "").trim();
  const name_it = toText(formData.get("name_it"));
  const name_en = toText(formData.get("name_en"));
  const description_it = toText(formData.get("description_it"));
  const description_en = toText(formData.get("description_en"));

  const price_eur = toNumber(formData.get("price_eur"), 0);
  const position = toInt(formData.get("position"), 0);
  const quantity = toNullableInt(formData.get("quantity"));

  const is_available = toBool(formData.get("is_available"));
  const is_daily_special = toBool(formData.get("is_daily_special"));

  const image_url = toText(formData.get("image_url"));
  const tagIds = getIds(formData, "tag_ids");
  const allergenIds = getIds(formData, "allergen_ids");

  if (!category_id) throw new Error("Categoria mancante.");
  if (!name_it && !name_en) throw new Error("Inserisci almeno un nome (IT o EN).");

  const { data: inserted, error } = await supabase
    .from("dishes")
    .insert({
      category_id,
      name_it,
      name_en,
      description_it,
      description_en,
      price_eur,
      position,
      quantity,
      is_available,
      is_daily_special,
      image_url,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const dishId = inserted.id as string;
  await upsertDishJoins(supabase, dishId, tagIds, allergenIds); // FIX Bug 5: passa supabase

  revalidateAll(dishId); // FIX Bug 1
  redirect(`/admin/dishes/${dishId}?saved=1`);
}

export async function updateDishAction(dishId: string, formData: FormData) {
  const { supabase } = await requireAdmin(); // FIX Bug 5: un solo requireAdmin()

  const category_id = String(formData.get("category_id") ?? "").trim();
  const name_it = toText(formData.get("name_it"));
  const name_en = toText(formData.get("name_en"));
  const description_it = toText(formData.get("description_it"));
  const description_en = toText(formData.get("description_en"));

  const price_eur = toNumber(formData.get("price_eur"), 0);
  const position = toInt(formData.get("position"), 0);
  const quantity = toNullableInt(formData.get("quantity"));

  const is_available = toBool(formData.get("is_available"));
  const is_daily_special = toBool(formData.get("is_daily_special"));

  const image_url = toText(formData.get("image_url"));
  const tagIds = getIds(formData, "tag_ids");
  const allergenIds = getIds(formData, "allergen_ids");

  if (!category_id) throw new Error("Categoria mancante.");
  if (!name_it && !name_en) throw new Error("Inserisci almeno un nome (IT o EN).");

  // FIX Bug 3: recupera vecchia immagine per poterla cancellare da Storage se cambia
  const { data: existing } = await supabase
    .from("dishes")
    .select("image_url")
    .eq("id", dishId)
    .single();

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
      quantity,
      is_available,
      is_daily_special,
      image_url: image_url || null,
    })
    .eq("id", dishId);

  if (error) throw new Error(error.message);

  // FIX Bug 3: se l'immagine è cambiata, cancella la vecchia da Storage
  const oldUrl = existing?.image_url ?? null;
  const newUrl = image_url || null;
  if (oldUrl && oldUrl !== newUrl) {
    await tryDeleteStorageImage(supabase, oldUrl);
  }

  await upsertDishJoins(supabase, dishId, tagIds, allergenIds); // FIX Bug 5: passa supabase

  revalidateAll(dishId); // FIX Bug 1
  redirect(`/admin/dishes/${dishId}?saved=1`);
}

export async function deleteDishAction(dishId: string) {
  const { supabase } = await requireAdmin();

  // FIX Bug 3: recupera URL immagine prima di cancellare il record
  const { data: existing } = await supabase
    .from("dishes")
    .select("image_url")
    .eq("id", dishId)
    .single();

  await supabase.from("dish_tags").delete().eq("dish_id", dishId);
  await supabase.from("dish_allergens").delete().eq("dish_id", dishId);

  const { error } = await supabase.from("dishes").delete().eq("id", dishId);
  if (error) throw new Error(error.message);

  // FIX Bug 3: cancella immagine da Storage dopo aver eliminato il record
  await tryDeleteStorageImage(supabase, existing?.image_url);

  revalidateAll(); // FIX Bug 1
  redirect("/admin/dishes");
}

export async function quickToggleAvailability(dishId: string, nextValue: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("dishes")
    .update({ is_available: nextValue })
    .eq("id", dishId);
  if (error) throw new Error(error.message);
  revalidateAll(dishId); // FIX Bug 1
}

export async function quickToggleDailySpecial(dishId: string, nextValue: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("dishes")
    .update({ is_daily_special: nextValue })
    .eq("id", dishId);
  if (error) throw new Error(error.message);
  revalidateAll(dishId); // FIX Bug 1
}

/**
 * Sposta su/giù dentro la stessa categoria (swap position con il vicino).
 * direction: "up" | "down"
 */
export async function moveDishInCategory(dishId: string, direction: "up" | "down") {
  const { supabase } = await requireAdmin();

  type DishPosRow = { id: string; category_id: string; position: number | null };
  type NeighborRow = { id: string; position: number | null };

  const { data: dish, error: dErr } = await supabase
    .from("dishes")
    .select("id,category_id,position")
    .eq("id", dishId)
    .maybeSingle<DishPosRow>();

  if (dErr) throw new Error(dErr.message);
  if (!dish) return;

  const pos = dish.position ?? 0;

  const neighborQuery = supabase
    .from("dishes")
    .select("id,position")
    .eq("category_id", dish.category_id)
    .neq("id", dish.id);

  const neighborRes =
    direction === "up"
      ? await neighborQuery
          .lt("position", pos)
          .order("position", { ascending: false })
          .limit(1)
          .maybeSingle<NeighborRow>()
      : await neighborQuery
          .gt("position", pos)
          .order("position", { ascending: true })
          .limit(1)
          .maybeSingle<NeighborRow>();

  // FIX Bug 4: errore reale del DB → lancia l'eccezione invece di ignorarla
  if (neighborRes.error) throw new Error(neighborRes.error.message);

  // Nessun vicino = già in cima/fondo: niente da fare
  const neighbor = neighborRes.data;
  if (!neighbor) {
    revalidatePath("/admin/dishes");
    return;
  }

  const a = dish.position ?? 0;
  const b = neighbor.position ?? 0;

  // swap positions
  const { error: u1 } = await supabase
    .from("dishes")
    .update({ position: b })
    .eq("id", dish.id);
  if (u1) throw new Error(u1.message);

  const { error: u2 } = await supabase
    .from("dishes")
    .update({ position: a })
    .eq("id", neighbor.id);
  if (u2) throw new Error(u2.message);

  revalidateAll(); // FIX Bug 1
}
