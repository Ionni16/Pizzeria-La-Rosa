// lib/supabase/menu/getMenuData.ts
import { unstable_cache } from "next/cache";
import { createSupabasePublicServerClient } from "@/lib/supabase/public";

export type CategoryRow = {
  id: string;
  name_it: string;
  name_en: string;
  position: number;
  is_active: boolean;
};

export type TagRow = {
  id: string;
  label_it: string;
  label_en: string;
  created_at?: string;
};

export type AllergenRow = {
  id: string;
  code: string | null;
  label_it: string;
  label_en: string;
  created_at?: string;
};

// join rows can come back as object OR array (depending on FK resolution)
export type DishTagJoinRow = { tag: TagRow | TagRow[] | null };
export type DishAllergenJoinRow = { allergen: AllergenRow | AllergenRow[] | null };

export type DishRow = {
  id: string;
  category_id: string | null;
  name_it: string;
  name_en: string;
  description_it: string | null;
  description_en: string | null;
  price_eur: number | null;
  position: number;
  is_available: boolean;
  is_daily_special: boolean | null;
  image_url: string | null;
  dish_tags?: DishTagJoinRow[] | null;
  dish_allergens?: DishAllergenJoinRow[] | null;
};

type MenuData = {
  categories: CategoryRow[];
  dishes: DishRow[];
};

/**
 * Cached public menu fetch.
 * Uses public supabase client (no cookies) to avoid auth overhead and enable caching.
 */
export const getMenuData = unstable_cache(
  async (): Promise<MenuData> => {
    const supabase = createSupabasePublicServerClient();

    const [catRes, dishRes] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name_it, name_en, position, is_active")
        .eq("is_active", true)
        .order("position", { ascending: true }),

      supabase
        .from("dishes")
        .select(
          `
          id,
          category_id,
          name_it,
          name_en,
          description_it,
          description_en,
          price_eur,
          position,
          is_available,
          is_daily_special,
          image_url,
          dish_tags: dish_tags(
            tag: tags(id, label_it, label_en, created_at)
          ),
          dish_allergens: dish_allergens(
            allergen: allergens(id, code, label_it, label_en, created_at)
          )
        `
        )
        .eq("is_available", true)
        .order("position", { ascending: true }),
    ]);

    if (catRes.error) throw new Error(catRes.error.message);
    if (dishRes.error) throw new Error(dishRes.error.message);

    return {
      categories: (catRes.data ?? []) as CategoryRow[],
      dishes: (dishRes.data ?? []) as DishRow[],
    };
  },
  ["public-menu-v3"],
  { revalidate: 60 }
);
