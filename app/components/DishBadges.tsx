// app/components/DishBadges.tsx
import * as React from "react";
import type { AllergenRow, TagRow } from "@/lib/supabase/menu/getMenuData";

type Lang = "it" | "en";

function pickLang(lang: Lang, it: string | null, en: string | null) {
  const v = lang === "it" ? it : en;
  return (v ?? it ?? en ?? "").trim();
}

export default function DishBadges({
  lang,
  tags,
  allergens,
}: {
  lang: Lang;
  tags: TagRow[];
  allergens: AllergenRow[];
}) {
  const tagItems = [...tags].sort((a: TagRow, b: TagRow) =>
    pickLang(lang, a.label_it, a.label_en).localeCompare(pickLang(lang, b.label_it, b.label_en), lang)
  );

  // Prima per code, poi per label
  const allergenItems = [...allergens].sort((a: AllergenRow, b: AllergenRow) => {
    const ac = (a.code ?? "").toUpperCase();
    const bc = (b.code ?? "").toUpperCase();
    if (ac !== bc) return ac.localeCompare(bc);
    return pickLang(lang, a.label_it, a.label_en).localeCompare(pickLang(lang, b.label_it, b.label_en), lang);
  });

  if (!tagItems.length && !allergenItems.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {tagItems.map((t: TagRow) => (
        <span
          key={`tag-${t.id}`}
          className="inline-flex items-center rounded-full border border-black/15 bg-white/60 px-2.5 py-1 text-xs text-black/80"
        >
          {pickLang(lang, t.label_it, t.label_en)}
        </span>
      ))}

      {allergenItems.map((a: AllergenRow) => {
        const label = pickLang(lang, a.label_it, a.label_en);
        const code = (a.code ?? "").trim();

        return (
          <span
            key={`allergen-${a.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white/60 px-2.5 py-1 text-xs text-black/80"
            title={label}
          >
            {code ? (
              <span className="grid h-4 w-4 place-items-center rounded-full border border-black/20 bg-white text-[10px] font-semibold leading-none">
                {code}
              </span>
            ) : null}
            <span>{label}</span>
          </span>
        );
      })}
    </div>
  );
}
