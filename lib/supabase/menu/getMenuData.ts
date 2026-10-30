// lib/supabase/menu/getMenuData.ts
import { unstable_cache } from "next/cache";

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

/** Public menu from the Hetzner read-only API (server-side only). */
type ApiCategory = CategoryRow;
type ApiTag = TagRow;
type ApiAllergen = AllergenRow;
type ApiDish = Omit<DishRow, "dish_tags" | "dish_allergens" | "price_eur"> & {
  price_eur: string | number | null;
  tags: ApiTag[];
  allergens: ApiAllergen[];
};
type ApiMenu = { categories: ApiCategory[]; dishes: ApiDish[] };

export const getMenuData = unstable_cache(
  async (): Promise<MenuData> => {
    const baseUrl = process.env.PIZZERIA_API_URL || "https://api-pizzeria.lariosystems.it";
    const url = `${baseUrl.replace(/\/$/, "")}/api/menu`;
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(`Menu API HTTP ${response.status}`);
    const json = (await response.json()) as ApiMenu;
    if (!Array.isArray(json.categories) || !Array.isArray(json.dishes)) {
      throw new Error("Menu API response has unexpected format");
    }
    return {
      categories: json.categories.map((c) => ({ ...c, is_active: true })),
      dishes: json.dishes.map((d) => ({
        id: d.id,
        category_id: d.category_id,
        name_it: d.name_it,
        name_en: d.name_en,
        description_it: d.description_it,
        description_en: d.description_en,
        price_eur: d.price_eur === null ? null : Number(d.price_eur),
        position: d.position,
        is_available: true,
        is_daily_special: d.is_daily_special,
        // Images are temporarily unavailable due to Supabase Storage 402.
        // Avoid using the blocked URLs until the files are migrated.
        image_url: d.image_url?.includes(".supabase.co/storage/v1/") ? null : d.image_url,
        dish_tags: (d.tags || []).map((tag) => ({ tag })),
        dish_allergens: (d.allergens || []).map((allergen) => ({ allergen })),
      })),
    };
  },
  ["public-menu-hetzner-v1"],
  { revalidate: 60 }
);
