"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";


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

async function upsertDishJoins(dishId: string, tagIds: string[], allergenIds: string[]) {
  const { supabase } = await requireAdmin();

  await supabase.from("dish_tags").delete().eq("dish_id", dishId);
  if (tagIds.length) {
    const rows = tagIds.map((tag_id) => ({ dish_id: dishId, tag_id }));
    const { error } = await supabase.from("dish_tags").insert(rows);
    if (error) throw new Error(error.message);
  }

  await supabase.from("dish_allergens").delete().eq("dish_id", dishId);
  if (allergenIds.length) {
    const rows = allergenIds.map((allergen_id) => ({ dish_id: dishId, allergen_id }));
    const { error } = await supabase.from("dish_allergens").insert(rows);
    if (error) throw new Error(error.message);
  }
}

export async function createDishAction(formData: FormData) {
  const { supabase } = await requireAdmin();

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
  await upsertDishJoins(dishId, tagIds, allergenIds);

  revalidatePath("/admin/dishes");
  revalidatePath(`/admin/dishes/${dishId}`);
  revalidatePath("/");

  // ✅ UN SOLO redirect
  redirect(`/admin/dishes/${dishId}?saved=1`);
}


export async function updateDishAction(dishId: string, formData: FormData) {
  const { supabase } = await requireAdmin();

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

  await upsertDishJoins(dishId, tagIds, allergenIds);

  revalidatePath("/admin/dishes");
  revalidatePath(`/admin/dishes/${dishId}`);
  revalidatePath("/");

  // ✅ redirect per mostrare banner "Salvato ✅"
  redirect(`/admin/dishes/${dishId}?saved=1`);
}


export async function deleteDishAction(dishId: string) {
  const { supabase } = await requireAdmin();

  await supabase.from("dish_tags").delete().eq("dish_id", dishId);
  await supabase.from("dish_allergens").delete().eq("dish_id", dishId);

  const { error } = await supabase.from("dishes").delete().eq("id", dishId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dishes");
  revalidatePath("/");
  redirect("/admin/dishes");
}

export async function quickToggleAvailability(dishId: string, nextValue: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("dishes").update({ is_available: nextValue }).eq("id", dishId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/dishes");
  revalidatePath("/");
}

export async function quickToggleDailySpecial(dishId: string, nextValue: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("dishes").update({ is_daily_special: nextValue }).eq("id", dishId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/dishes");
  revalidatePath("/");
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

  if (neighborRes.error) {
    // se non trova nulla, non è un errore “reale”: significa che sei già in cima/fondo
    revalidatePath("/admin/dishes");
    return;
  }

  const neighbor = neighborRes.data;
  if (!neighbor) {
    revalidatePath("/admin/dishes");
    return;
  }

  const a = dish.position ?? 0;
  const b = neighbor.position ?? 0;

  // swap positions
  const { error: u1 } = await supabase.from("dishes").update({ position: b }).eq("id", dish.id);
  if (u1) throw new Error(u1.message);

  const { error: u2 } = await supabase.from("dishes").update({ position: a }).eq("id", neighbor.id);
  if (u2) throw new Error(u2.message);

  revalidatePath("/admin/dishes");
  revalidatePath("/");
}

