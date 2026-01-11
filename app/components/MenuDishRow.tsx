// app/components/MenuDishRow.tsx
import * as React from "react";
import DishImage from "@/app/components/DishImage";
import type { DishRow, TagRow, AllergenRow } from "@/lib/supabase/menu/getMenuData";

type Lang = "it" | "en";

function pickLang(lang: Lang, it: string | null, en: string | null) {
  const v = lang === "it" ? it : en;
  return (v ?? it ?? en ?? "").trim();
}

/**
 * Safe collator: avoids RangeError on environments without full ICU locale data.
 * Falls back to default collation if locale is not supported.
 */
function makeSafeCollator(lang: Lang) {
  const preferred = lang === "it" ? ["it-IT", "it", "en"] : ["en-US", "en", "it"];

  try {
    return new Intl.Collator(preferred, { sensitivity: "base", numeric: true });
  } catch {
    // Last resort
    return new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
  }
}

function formatPriceEUR(value: number | null) {
  if (value == null) return null;
  return `€ ${value.toFixed(2)}`.replace(".", ",");
}

function normalizeMaybeArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function extractTags(lang: Lang, d: DishRow): TagRow[] {
  const joins = d.dish_tags ?? [];
  const out: TagRow[] = [];
  for (const j of joins) for (const t of normalizeMaybeArray(j?.tag)) out.push(t);

  const collator = makeSafeCollator(lang);
  out.sort((a, b) =>
    collator.compare(pickLang(lang, a.label_it, a.label_en), pickLang(lang, b.label_it, b.label_en))
  );

  return out;
}

function extractAllergens(lang: Lang, d: DishRow): AllergenRow[] {
  const joins = d.dish_allergens ?? [];
  const out: AllergenRow[] = [];
  for (const j of joins) for (const a of normalizeMaybeArray(j?.allergen)) out.push(a);

  const collator = makeSafeCollator(lang);
  out.sort((a, b) => {
    const ac = (a.code ?? "").toUpperCase();
    const bc = (b.code ?? "").toUpperCase();
    if (ac !== bc) return collator.compare(ac, bc);
    return collator.compare(pickLang(lang, a.label_it, a.label_en), pickLang(lang, b.label_it, b.label_en));
  });

  return out;
}

export default function MenuDishRow({ lang, dish }: { lang: Lang; dish: DishRow }) {
  const name = pickLang(lang, dish.name_it, dish.name_en);
  const description = pickLang(lang, dish.description_it, dish.description_en);
  const price = formatPriceEUR(dish.price_eur);

  const tags = extractTags(lang, dish);
  const allergens = extractAllergens(lang, dish);

  const allergenLabel = lang === "it" ? "ALLERGENI:" : "ALLERGENS:";
  const allergenText =
    allergens.length > 0
      ? allergens.map((a) => pickLang(lang, a.label_it, a.label_en)).filter(Boolean).join(", ")
      : null;

  return (
    <article className="py-5 border-b border-black/10">
      {/* TOP: foto a sinistra accanto al titolo, prezzo a destra */}
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          {dish.image_url ? (
            <DishImage
              src={dish.image_url}
              alt={name}
              className="h-12 w-12 rounded-full border border-black/10 object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full border border-black/10 bg-black/5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <h3 className="min-w-0 truncate text-[21px] sm:text-[22px] font-semibold tracking-tight text-neutral-900 leading-tight">
              {name}
            </h3>

            {price ? (
              <div className="shrink-0 text-[16px] sm:text-[17px] font-semibold text-[#c81f2d] tabular-nums leading-tight">
                {price}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Sotto: descrizione + allergeni + tags */}
      {(description || allergenText || tags.length > 0) ? (
        <div className="mt-2">
          {description ? (
            <p className="text-[14.5px] leading-relaxed text-neutral-700">{description}</p>
          ) : null}

          {allergenText ? (
            <p className="mt-2 text-[13px] text-neutral-700">
              <span className="font-semibold text-neutral-800">{allergenLabel}</span> {allergenText}
            </p>
          ) : null}

          {tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center rounded-full border border-black/10 bg-white/85 px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-wide text-[#1f7a3a]"
                >
                  {pickLang(lang, t.label_it, t.label_en)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
