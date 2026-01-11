// app/admin/(protected)/dishes/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";

import CategorySelect from "./_components/CategorySelect";
import SafeImg from "./_components/SafeImg";
import DishRowActions from "./_components/DishRowActions";

type CategoryRow = {
  id: string;
  name_it: string | null;
  name_en: string | null;
  position: number | null;
  is_active: boolean | null;
};

type DishRow = {
  id: string;
  category_id: string | null;
  name_it: string | null;
  name_en: string | null;
  price_eur: number | null;
  position: number | null;
  quantity: number | null;
  is_available: boolean | null;
  image_url: string | null;
};

function titleOf(d: DishRow) {
  return (d.name_it ?? d.name_en ?? "Senza nome").trim();
}

function euro(n: number | null) {
  const v = Number(n ?? 0);
  return v.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
}

export default async function AdminDishesListPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const sp = (await searchParams) ?? {};

  const { data: categories, error: cErr } = await supabase
    .from("categories")
    .select("id,name_it,name_en,position,is_active")
    .order("position", { ascending: true })
    .returns<CategoryRow[]>();

  if (cErr) throw new Error(cErr.message);

  const catList = (categories ?? []).filter((c) => c.is_active !== false);
  const firstCat = catList[0];

  if (!firstCat) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Piatti</h1>
        <p className="mt-2 text-sm text-black/60">Nessuna categoria attiva trovata.</p>
      </div>
    );
  }

  const selectedCategoryId = sp.category?.trim() || "";
  if (!selectedCategoryId) {
    redirect(`/admin/dishes?category=${firstCat.id}`);
  }

  const { data: dishes, error: dErr } = await supabase
    .from("dishes")
    .select("id,category_id,name_it,name_en,price_eur,position,quantity,is_available,image_url")
    .eq("category_id", selectedCategoryId)
    .order("position", { ascending: true })
    .returns<DishRow[]>();

  if (dErr) throw new Error(dErr.message);

  return (
    <main className="min-h-screen bg-[rgb(252,250,246)] text-neutral-900 overflow-x-hidden">
      <CategorySelect categories={catList} currentCategoryId={selectedCategoryId} />

      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">Piatti</h1>
            <p className="mt-1 text-sm text-black/55">
              Seleziona una categoria per vedere e gestire i piatti.
            </p>
          </div>

          <Link
            href="/admin"
            className="hidden sm:inline-flex shrink-0 rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-black/10 bg-white hover:bg-black/5"
          >
            Dashboard
          </Link>
        </div>

        {/* List */}
        <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-black/10 bg-white">
          {!dishes || dishes.length === 0 ? (
            <div className="p-6">
              <div className="text-sm font-semibold">Nessun piatto in questa categoria.</div>
              <p className="mt-1 text-sm text-black/55">Crea il primo piatto con “Nuovo piatto”.</p>
            </div>
          ) : (
            <ul className="divide-y divide-black/10">
              {dishes.map((d) => {
                const t = titleOf(d);
                const isAvailable = !(d.is_available === false);

                return (
                  <li key={d.id} className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left */}
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Thumbnail */}
                        {d.image_url ? (
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-1 ring-black/10 bg-[rgb(252,250,246)]">
                            <SafeImg src={d.image_url} alt="" className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-14 w-14 shrink-0 rounded-2xl ring-1 ring-black/10 bg-[rgb(252,250,246)]" />
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="truncate text-base sm:text-lg font-semibold min-w-0">
                              {t}
                            </div>

                            {isAvailable ? (
                              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                                Visibile
                              </span>
                            ) : (
                              <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-red-200">
                                Nascosto
                              </span>
                            )}
                          </div>

                          <div className="mt-1 text-sm text-black/55">
                            Pos. {d.position ?? 0}
                            {typeof d.quantity === "number" ? ` · Q.tà ${d.quantity}` : ` · Q.tà ∞`}
                          </div>
                        </div>
                      </div>

                      {/* Right price */}
                      <div className="shrink-0 text-right">
                        <div className="text-base sm:text-lg font-semibold text-[color:var(--brand-red)] tabular-nums">
                          {euro(d.price_eur)}
                        </div>
                      </div>
                    </div>

                    {/* Actions (client) */}
                    <DishRowActions dishId={d.id} isAvailable={isAvailable} title={t} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="h-10" />
      </div>
    </main>
  );
}
