"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

type Category = { id: string; name_it: string | null; name_en: string | null };

export default function CategorySelect({
  categories,
  currentCategoryId,
}: {
  categories: Category[];
  currentCategoryId: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;

    const params = new URLSearchParams(sp.toString());
    params.set("category", next);
    params.delete("page");

    router.push(`/admin/dishes?${params.toString()}`);
  }

  return (
    <div className="sticky top-0 z-10 bg-[rgb(252,250,246)]/90 backdrop-blur border-b border-black/10">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-wide text-black/55 uppercase">
              Categoria
            </div>

            <select
              value={currentCategoryId}
              onChange={onChange}
              className="mt-1 w-full max-w-[340px] rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold outline-none
                         focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_it ?? c.name_en ?? "Senza nome"}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/admin/dishes/new"
            className="shrink-0 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
          >
            + Nuovo piatto
          </Link>
        </div>
      </div>
    </div>
  );
}
