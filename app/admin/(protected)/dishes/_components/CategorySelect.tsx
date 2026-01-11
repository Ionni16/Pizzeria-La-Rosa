"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type CategoryRow = {
  id: string;
  name_it: string | null;
  name_en: string | null;
  position: number | null;
  is_active: boolean | null;
};

export default function CategorySelect({
  categories,
  currentCategoryId,
}: {
  categories: CategoryRow[];
  currentCategoryId: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const [value, setValue] = React.useState(currentCategoryId);

  React.useEffect(() => {
    setValue(currentCategoryId);
  }, [currentCategoryId]);

  function onChange(next: string) {
    setValue(next);

    const params = new URLSearchParams(sp?.toString() ?? "");
    params.set("category", next);

    router.push(`/admin/dishes?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-5">
      <section
        className={[
          "rounded-2xl bg-[rgb(252,250,246)] ring-1 ring-black/10",
          "px-4 py-4",
        ].join(" ")}
      >
        {/* MOBILE: colonna (no overflow). DESKTOP: riga */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-[0.16em] text-black/55">
              CATEGORIA
            </div>

            <div className="mt-2">
              <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={[
                  "w-full",                // ✅ mai più overflow
                  "min-w-0",               // ✅ evita min-width implicite
                  "rounded-2xl border border-black/10 bg-white",
                  "px-4 py-3 text-[16px] font-semibold text-black/85",
                  "outline-none",
                  "focus:ring-2 focus:ring-[color:var(--brand-red)]/30",
                ].join(" ")}
              >
                {categories.map((c) => {
                  const label = (c.name_it ?? c.name_en ?? "Senza nome").trim();
                  return (
                    <option key={c.id} value={c.id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* CTA: su mobile full-width, su desktop auto */}
          <div className="flex sm:block">
            <Link
              href="/admin/dishes/new"
              className={[
                "inline-flex items-center justify-center gap-2",
                "w-full sm:w-auto", // ✅ su mobile non sborda
                "rounded-2xl bg-black px-5 py-3",
                "text-[15px] font-semibold text-white",
                "shadow-sm hover:bg-black/90",
              ].join(" ")}
            >
              <span className="text-lg leading-none">+</span>
              Nuovo piatto
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
