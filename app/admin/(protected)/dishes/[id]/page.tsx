// app/admin/(protected)/dishes/[id]/page.tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/auth";
import DishForm, { DishInitial } from "../_components/DishForm";
import { updateDishAction } from "../_actions";

type CategoryRow = {
  id: string;
  name_it: string | null;
  name_en: string | null;
  position: number | null;
  is_active: boolean | null;
};

type TagRow = {
  id: string;
  label_it: string | null;
  label_en: string | null;
};

type AllergenRow = {
  id: string;
  code: string | null;
  label_it: string | null;
  label_en: string | null;
};

type DishRow = {
  id: string;
  category_id: string;
  name_it: string | null;
  name_en: string | null;
  description_it: string | null;
  description_en: string | null;
  price_eur: number | null;
  quantity: number | null;
  position: number | null;
  is_available: boolean | null;
  is_daily_special: boolean | null;
  image_url: string | null;
};

type DishTagRow = { tag_id: string };
type DishAllergenRow = { allergen_id: string };

export default async function EditDishPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id: dishId } = await params;

  const sp = (await searchParams) ?? {};
  const saved = sp.saved === "1";

  const [
    { data: categories, error: cErr },
    { data: tags, error: tErr },
    { data: allergens, error: aErr },
  ] = await Promise.all([
    supabase.from("categories").select("id,name_it,name_en,position,is_active").order("position", { ascending: true }),
    supabase.from("tags").select("id,label_it,label_en").order("label_it", { ascending: true }),
    supabase.from("allergens").select("id,code,label_it,label_en").order("label_it", { ascending: true }),
  ]);

  if (cErr) throw new Error(cErr.message);
  if (tErr) throw new Error(tErr.message);
  if (aErr) throw new Error(aErr.message);

  const catList: CategoryRow[] = (categories ?? []).filter((c) => c.is_active !== false);
  const tagList: TagRow[] = tags ?? [];
  const allergenList: AllergenRow[] = allergens ?? [];

  const { data: dish, error } = await supabase
    .from("dishes")
    .select("id,category_id,name_it,name_en,description_it,description_en,price_eur,quantity,position,is_available,is_daily_special,image_url")
    .eq("id", dishId)
    .single<DishRow>();

  if (error || !dish) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Piatto non trovato</h1>
        <p className="mt-2 text-sm text-black/60">ID: {dishId}</p>
        <Link
          href="/admin/dishes"
          className="mt-6 inline-block rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-black/10 hover:bg-black/5"
        >
          ← Torna ai piatti
        </Link>
      </div>
    );
  }

  const [{ data: dishTagRows }, { data: dishAllergenRows }] = await Promise.all([
    supabase.from("dish_tags").select("tag_id").eq("dish_id", dishId).returns<DishTagRow[]>(),
    supabase.from("dish_allergens").select("allergen_id").eq("dish_id", dishId).returns<DishAllergenRow[]>(),
  ]);

  const initial: DishInitial = {
    id: dish.id,
    category_id: dish.category_id,
    name_it: dish.name_it,
    name_en: dish.name_en,
    description_it: dish.description_it,
    description_en: dish.description_en,
    price_eur: dish.price_eur,
    quantity: dish.quantity,
    position: dish.position,
    is_available: dish.is_available,
    is_daily_special: dish.is_daily_special, // (non lo mostriamo più)
    image_url: dish.image_url,
    selected_tag_ids: (dishTagRows ?? []).map((r) => String(r.tag_id)),
    selected_allergen_ids: (dishAllergenRows ?? []).map((r) => String(r.allergen_id)),
  };

  return (
    <>
      {saved ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Salvato ✅
        </div>
      ) : null}

      <DishForm
        mode="edit"
        categories={catList}
        tags={tagList}
        allergens={allergenList}
        initial={initial}
        action={updateDishAction.bind(null, dishId)}
        submitLabel="Salva modifiche"
      />
    </>
  );
}
