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
  // checkbox: "on" se checked, null se unchecked
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
        <p className="mt-3 text-sm text-red-700">
          Errore caricando le categorie: {error.message}
        </p>
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
    revalidatePath("/");
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorie</h1>
          <p className="mt-1 text-sm text-black/60">
            Crea, riordina con <b>position</b>, attiva/disattiva con <b>is_active</b>.
          </p>
        </div>
      </div>

      {/* CREA */}
      <section className="mt-6 rounded-2xl bg-[rgb(252,250,246)] ring-1 ring-black/5 p-4">
        <h2 className="text-sm font-semibold tracking-tight">Nuova categoria</h2>

        <form action={createCategory} className="mt-3 grid gap-3 sm:grid-cols-4">
          <label className="block sm:col-span-1">
            <span className="text-xs font-medium text-black/70">Nome (IT)</span>
            <input
              name="name_it"
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
              placeholder="Pizze"
            />
          </label>

          <label className="block sm:col-span-1">
            <span className="text-xs font-medium text-black/70">Nome (EN)</span>
            <input
              name="name_en"
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
              placeholder="Pizzas"
            />
          </label>

          <label className="block sm:col-span-1">
            <span className="text-xs font-medium text-black/70">Position</span>
            <input
              name="position"
              inputMode="numeric"
              defaultValue="0"
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
              placeholder="0"
            />
          </label>

          <div className="flex items-end justify-between gap-3 sm:col-span-1">
            <label className="flex items-center gap-2 rounded-xl px-3 py-2 ring-1 ring-black/10 bg-white">
              <input name="is_active" type="checkbox" defaultChecked />
              <span className="text-sm text-black/70">Attiva</span>
            </label>

            <button
              type="submit"
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black/90"
            >
              Crea
            </button>
          </div>
        </form>
      </section>

      {/* LISTA */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Elenco</h2>
          <div className="text-xs text-black/45">{categories.length} categorie</div>
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-black/5">
          <div className="grid grid-cols-[1fr_1fr_90px_90px_140px] bg-[rgb(252,250,246)] px-3 py-2 text-xs font-medium text-black/60">
            <div>Nome (IT)</div>
            <div>Nome (EN)</div>
            <div className="text-right">Position</div>
            <div className="text-center">Attiva</div>
            <div className="text-right">Azioni</div>
          </div>

          <div className="divide-y divide-black/5 bg-white">
            {categories.map((c) => (
              <div key={c.id} className="px-3 py-3">
                <div className="grid grid-cols-[1fr_1fr_90px_90px_140px] items-center gap-2">
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
                        className="rounded-xl px-3 py-2 text-sm font-medium ring-1 ring-black/10 hover:bg-black/[0.03]"
                      >
                        Salva
                      </button>
                    </div>
                  </form>

                  <form action={deleteCategory} className="flex justify-end">
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      type="submit"
                      className="rounded-xl px-3 py-2 text-sm font-medium ring-1 ring-red-200 text-red-700 hover:bg-red-50"
                    >
                      Elimina
                    </button>
                  </form>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="px-3 py-6 text-sm text-black/50">
                Nessuna categoria ancora. Creane una sopra.
              </div>
            )}
          </div>
        </div>

        <p className="mt-3 text-xs text-black/45">
          Nota: se una categoria ha piatti collegati, l’eliminazione potrebbe essere bloccata dalle FK.
        </p>
      </section>
    </div>
  );
}
