import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";

type CategoryRow = {
  id: string;
  name_it: string | null;
  name_en: string | null;
  position: number | null;
  is_active: boolean | null;
};

function toInt(value: FormDataEntryValue | null, fallback = 0) {
  const n = Number(String(value ?? "").trim());
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function toText(value: FormDataEntryValue | null) {
  const s = String(value ?? "").trim();
  return s.length ? s : null;
}

function toBoolFromCheckbox(value: FormDataEntryValue | null) {
  return value === "on";
}

export default async function CategoriesAdminPage() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("categories")
    .select("id,name_it,name_en,position,is_active")
    .order("position", { ascending: true })
    .order("name_it", { ascending: true });

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categorie</h1>
        <p className="mt-3 text-sm text-red-700">Errore caricando le categorie: {error.message}</p>
      </div>
    );
  }

  const categories = (data ?? []) as CategoryRow[];

  async function createCategory(formData: FormData) {
    "use server";
    const { supabase } = await requireAdmin();

    const name_it = toText(formData.get("name_it"));
    const name_en = toText(formData.get("name_en"));
    const position = toInt(formData.get("position"), 0);
    const is_active = toBoolFromCheckbox(formData.get("is_active"));

    if (!name_it && !name_en) return;

    const { error } = await supabase.from("categories").insert({
      name_it,
      name_en,
      position,
      is_active,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/dishes");
    revalidatePath("/");
  }

  async function updateCategory(formData: FormData) {
    "use server";
    const { supabase } = await requireAdmin();

    const id = String(formData.get("id") ?? "").trim();
    if (!id) return;

    const name_it = toText(formData.get("name_it"));
    const name_en = toText(formData.get("name_en"));
    const position = toInt(formData.get("position"), 0);
    const is_active = toBoolFromCheckbox(formData.get("is_active"));

    const { error } = await supabase
      .from("categories")
      .update({ name_it, name_en, position, is_active })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/dishes");
    revalidatePath("/");
  }

  async function deleteCategory(formData: FormData) {
    "use server";
    const { supabase } = await requireAdmin();

    const id = String(formData.get("id") ?? "").trim();
    if (!id) return;

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/dishes");
    revalidatePath("/");
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorie</h1>
          <p className="mt-1 text-sm text-black/60">
            Lista pulita. Premi <b>Modifica</b> per cambiare posizione, IT/EN o attivazione.
          </p>
        </div>
        <div className="text-sm text-black/50">{categories.length} categorie</div>
      </div>

      {/* CREA (chiuso) */}
      <details className="mt-6 group rounded-2xl bg-[rgb(252,250,246)] ring-1 ring-black/5 overflow-hidden">
        <summary className="list-none cursor-pointer px-4 py-4 flex items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[color:var(--brand-red)]" />
            <div>
              <div className="text-sm font-semibold tracking-tight">Crea categoria</div>
              <div className="text-xs text-black/50">Apri per inserire IT/EN e posizione</div>
            </div>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-black/10">
            <span className="group-open:hidden text-xl leading-none">+</span>
            <span className="hidden group-open:inline text-xl leading-none">−</span>
          </span>
        </summary>

        <div className="px-4 pb-4">
          <form action={createCategory} className="grid gap-3 md:grid-cols-[1fr_1fr_140px_170px_160px]">
            <label className="block">
              <span className="text-xs font-medium text-black/70">Nome (IT)</span>
              <input
                name="name_it"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                placeholder="Pizze"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-black/70">Nome (EN)</span>
              <input
                name="name_en"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                placeholder="Pizzas"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-black/70">Posizione</span>
              <input
                name="position"
                inputMode="numeric"
                defaultValue="0"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
              />
            </label>

            <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-black/10 md:mt-6">
              <input name="is_active" type="checkbox" defaultChecked />
              <span className="text-sm text-black/70">Attiva</span>
            </label>

            <button
              type="submit"
              className="h-[42px] md:mt-6 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
            >
              Crea
            </button>
          </form>
        </div>
      </details>

      {/* LISTA (chiusa + apri solo con “Modifica”) */}
      <div className="mt-6 space-y-3">
        {categories.map((c) => {
          const it = (c.name_it ?? "").trim() || "—";
          const en = (c.name_en ?? "").trim() || "—";
          const pos = c.position ?? 0;
          const active = !(c.is_active === false);

          return (
            <details key={c.id} className="group rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
              <summary className="list-none cursor-pointer px-4 py-4 flex items-center justify-between gap-3 [&::-webkit-details-marker]:hidden hover:bg-black/[0.02] transition">
                <div className="min-w-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <div className="text-sm sm:text-base font-semibold text-black/90 truncate">{it}</div>
                    <div className="hidden sm:block h-1 w-1 rounded-full bg-black/20" />
                    <div className="text-sm sm:text-base text-black/60 truncate">{en}</div>

                    <div className="hidden sm:flex items-center gap-2 ml-2">
                      <span className="rounded-full bg-[rgb(252,250,246)] px-2 py-1 text-[11px] font-semibold text-black/70 ring-1 ring-black/10">
                        Pos. {pos}
                      </span>
                      {active ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          Attiva
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-red-200">
                          Disattiva
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mobile meta */}
                  <div className="mt-2 flex flex-wrap gap-2 sm:hidden">
                    <span className="rounded-full bg-[rgb(252,250,246)] px-2 py-1 text-[11px] font-semibold text-black/70 ring-1 ring-black/10">
                      Pos. {pos}
                    </span>
                    {active ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        Attiva
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-red-200">
                        Disattiva
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-black/10 bg-[rgb(252,250,246)] group-open:bg-white">
                  Modifica
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </div>
              </summary>

              <div className="px-4 pb-4">
                <div className="mt-2 h-px bg-black/10" />

                {/* UPDATE (form 1) */}
                <form action={updateCategory} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_140px_170px_160px]">
                  <input type="hidden" name="id" value={c.id} />

                  <label className="block">
                    <span className="text-xs font-medium text-black/70">Nome (IT)</span>
                    <input
                      name="name_it"
                      defaultValue={c.name_it ?? ""}
                      className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-black/70">Nome (EN)</span>
                    <input
                      name="name_en"
                      defaultValue={c.name_en ?? ""}
                      className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-black/70">Posizione</span>
                    <input
                      name="position"
                      inputMode="numeric"
                      defaultValue={String(c.position ?? 0)}
                      className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                    />
                  </label>

                  <label className="flex items-center gap-2 rounded-xl bg-[rgb(252,250,246)] px-3 py-2 ring-1 ring-black/10 md:mt-6">
                    <input name="is_active" type="checkbox" defaultChecked={!(c.is_active === false)} />
                    <span className="text-sm text-black/70">Attiva</span>
                  </label>

                  <button
                    type="submit"
                    className="h-[42px] md:mt-6 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
                  >
                    Salva
                  </button>
                </form>

                {/* DELETE (form 2, separato -> NO nested form) */}
                <form action={deleteCategory} className="mt-3">
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    type="submit"
                    className="w-full sm:w-auto h-[42px] rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-red-200 text-red-700 hover:bg-red-50"
                  >
                    Elimina
                  </button>
                </form>

                <p className="mt-3 text-xs text-black/45">
                  Nota: se una categoria ha piatti collegati, l’eliminazione può essere bloccata.
                </p>
              </div>
            </details>
          );
        })}

        {categories.length === 0 ? (
          <div className="rounded-2xl bg-white ring-1 ring-black/5 px-4 py-6 text-sm text-black/55">
            Nessuna categoria ancora. Crea la prima da “Crea categoria”.
          </div>
        ) : null}
      </div>
    </div>
  );
}
