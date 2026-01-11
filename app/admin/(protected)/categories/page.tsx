// app/admin/(protected)/categories/page.tsx
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

    const id = String(formData.get("id") ?? "");
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

    const id = String(formData.get("id") ?? "");
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
            Ordina con <b>position</b>. Disattiva con <b>is_active</b>. Completa IT/EN quando vuoi.
          </p>
        </div>

        <div className="text-sm text-black/50">{categories.length} categorie</div>
      </div>

      {/* CREA (premium toggle) */}
      <details className="mt-6 group rounded-2xl bg-[rgb(252,250,246)] ring-1 ring-black/5 overflow-hidden">
        <summary
          className="list-none cursor-pointer px-4 py-4 flex items-center justify-between gap-3
                     [&::-webkit-details-marker]:hidden"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[color:var(--brand-red)]" />
            <div>
              <div className="text-sm font-semibold tracking-tight">Crea categoria</div>
              <div className="text-xs text-black/50">Tocca per aprire i campi</div>
            </div>
          </div>

          <span className="grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-black/10">
            <span className="group-open:hidden text-xl leading-none">+</span>
            <span className="hidden group-open:inline text-xl leading-none">−</span>
          </span>
        </summary>

        <div className="px-4 pb-4">
          <form action={createCategory} className="grid gap-3 md:grid-cols-[1fr_1fr_140px_170px]">
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
              <span className="text-xs font-medium text-black/70">Position</span>
              <input
                name="position"
                inputMode="numeric"
                defaultValue="0"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
              />
              <span className="mt-1 block text-[11px] text-black/45">0 = in cima</span>
            </label>

            <div className="flex items-end gap-3">
              <label className="flex w-full items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-black/10">
                <span className="text-sm font-medium text-black/70">Attiva</span>
                <input name="is_active" type="checkbox" defaultChecked />
              </label>

              <button
                type="submit"
                className="shrink-0 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/90"
              >
                Crea
              </button>
            </div>
          </form>
        </div>
      </details>

      {/* LISTA */}
      <section className="mt-6">
        {/* desktop header */}
        <div className="hidden md:grid grid-cols-[1fr_1fr_120px_120px_190px] rounded-2xl bg-[rgb(252,250,246)] ring-1 ring-black/5 px-4 py-3 text-xs font-semibold text-black/60">
          <div>Nome (IT)</div>
          <div>Nome (EN)</div>
          <div className="text-right">Position</div>
          <div className="text-center">Attiva</div>
          <div className="text-right">Azioni</div>
        </div>

        <div className="mt-3 space-y-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden"
            >
              {/* DESKTOP ROW */}
              <div className="hidden md:block px-4 py-4">
                <div className="grid grid-cols-[1fr_1fr_120px_120px_190px] items-center gap-3">
                  <form action={updateCategory} className="contents">
                    <input type="hidden" name="id" value={c.id} />

                    <input
                      name="name_it"
                      defaultValue={c.name_it ?? ""}
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                      placeholder="(vuoto)"
                    />

                    <input
                      name="name_en"
                      defaultValue={c.name_en ?? ""}
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                      placeholder="(empty)"
                    />

                    <input
                      name="position"
                      defaultValue={String(c.position ?? 0)}
                      inputMode="numeric"
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                    />

                    <div className="flex justify-center">
                      <input name="is_active" type="checkbox" defaultChecked={!!c.is_active} />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="submit"
                        className="rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-black/10 hover:bg-black/5"
                      >
                        Salva
                      </button>
                    </div>
                  </form>

                  <form action={deleteCategory} className="flex justify-end">
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      type="submit"
                      className="rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-red-200 text-red-700 hover:bg-red-50"
                    >
                      Elimina
                    </button>
                  </form>
                </div>
              </div>

              {/* MOBILE CARD */}
              <div className="md:hidden p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {(c.name_it ?? c.name_en ?? "Senza nome").trim()}
                    </div>
                    <div className="mt-1 text-xs text-black/55">
                      Position: <span className="font-semibold">{c.position ?? 0}</span>
                      {" · "}
                      {c.is_active === false ? (
                        <span className="font-semibold text-red-700">Disattiva</span>
                      ) : (
                        <span className="font-semibold text-emerald-700">Attiva</span>
                      )}
                    </div>
                  </div>
                </div>

                <form action={updateCategory} className="mt-3 space-y-3">
                  <input type="hidden" name="id" value={c.id} />

                  <div className="grid gap-3">
                    <label className="block">
                      <span className="text-xs font-medium text-black/70">Nome (IT)</span>
                      <input
                        name="name_it"
                        defaultValue={c.name_it ?? ""}
                        className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                        placeholder="(vuoto)"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-black/70">Nome (EN)</span>
                      <input
                        name="name_en"
                        defaultValue={c.name_en ?? ""}
                        className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                        placeholder="(empty)"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-xs font-medium text-black/70">Position</span>
                        <input
                          name="position"
                          defaultValue={String(c.position ?? 0)}
                          inputMode="numeric"
                          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                        />
                      </label>

                      <label className="flex items-center justify-between gap-2 rounded-xl bg-[rgb(252,250,246)] px-3 py-2 ring-1 ring-black/5">
                        <span className="text-sm font-medium text-black/70">Attiva</span>
                        <input name="is_active" type="checkbox" defaultChecked={!!c.is_active} />
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-black/90"
                    >
                      Salva
                    </button>

                    <form action={deleteCategory} className="contents">
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        className="rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 ring-red-200 text-red-700 hover:bg-red-50"
                      >
                        Elimina
                      </button>
                    </form>
                  </div>
                </form>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="rounded-2xl bg-white ring-1 ring-black/5 px-4 py-6 text-sm text-black/55">
              Nessuna categoria ancora. Premi <b>Crea categoria</b> per aggiungerne una.
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-black/45">
          Nota: se una categoria ha piatti collegati, l’eliminazione può essere bloccata dalle foreign key.
        </p>
      </section>
    </div>
  );
}
