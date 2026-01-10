// app/admin/(protected)/dishes/new/page.tsx
import { requireAdmin } from "@/lib/supabase/auth";
import DishForm, { DishInitial } from "../_components/DishForm";
import { createDishAction } from "../_actions";

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

export default async function NewDishPage() {
  const { supabase } = await requireAdmin();

  const [{ data: categories, error: cErr }, { data: tags, error: tErr }, { data: allergens, error: aErr }] =
    await Promise.all([
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

  const initial: DishInitial = {
    category_id: catList[0]?.id ?? "",
    name_it: "",
    name_en: "",
    description_it: "",
    description_en: "",
    price_eur: 0,
    quantity: null,
    position: 0,
    is_available: true,
    is_daily_special: false, // (non lo mostriamo più nel form)
    image_url: null,
    selected_tag_ids: [],
    selected_allergen_ids: [],
  };

  return (
    <DishForm
      mode="create"
      categories={catList}
      tags={tagList}
      allergens={allergenList}
      initial={initial}
      action={createDishAction}
      submitLabel="Salva piatto"
    />
  );
}
