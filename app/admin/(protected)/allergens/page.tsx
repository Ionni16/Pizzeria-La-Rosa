import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";

type AllergenRow = {
  id: string;
  label_it: string | null;
  label_en: string | null;
};

function toText(value: FormDataEntryValue | null) {
  const s = String(value ?? "").trim();
  return s.length ? s : null;
}

export default async function AllergensAdminPage() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("allergens")
    .select("id,label_it,label_en")
    .order("label_it", { ascending: true });

  if (error) {
    return (
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight">Allergeni</h1>
        <p className="mt-3 text-sm text-red-700">
          Errore caricando gli allergeni: {error.message}
        </p>
      </div>
    );
  }

  const allergens = (data ?? []) as AllergenRow[];

  async function createAllergen(formData: FormData) {
    "use server";
    const { supabase } = await requireAdmin();

    const label_it = toText(formData.get("label_it"));
    const label_en = toText(formData.get("label_en"));
    if (!label_it && !label_en) return;

    const { error } = await supabase.from("allergens").insert({ label_it, label_en });
    if (error) throw new Error(error.message);

    revalidatePath("/admin/allergens");
    revalidatePath("/admin/dishes");
    revalidatePath("/");
  }

  async function updateAllergen(formData: FormData) {
    "use server";
    const { supabase } = await requireAdmin();

    const id = String(formData.get("id") ?? "").trim();
    if (!id) return;

    const label_it = toText(formData.get("label_it"));
    const label_en = toText(formData.get("label_en"));
    if (!label_it && !label_en) return;

    const { error } = await supabase.from("allergens").update({ label_it, label_en }).eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/allergens");
    revalidatePath("/admin/dishes");
    revalidatePath("/");
  }

  async function deleteAllergen(formData: FormData) {
    "use server";
    const { supabase } = await requireAdmin();

    const id = String(formData.get("id") ?? "").trim();
    if (!id) return;

    const { error } = await supabase.from("allergens").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/allergens");
    revalidatePath("/admin/dishes");
    revalidatePath("/");
  }

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Allergeni</h1>
          <p className="mt-1 text-sm text-black/60">
            Premi “Modifica” per cambiare o eliminare.
          </p>
        </div>
        <div className="text-sm text-black/50">{allergens.length} allergeni</div>
      </div>

      {/* CREA */}
      <details className="mt-6 group rounded-2xl bg-[rgb(252,250,246)] ring-1 ring-black/5 overflow-hidden">
        <summary className="list-none cursor-pointer px-4 py-4 flex items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[color:var(--brand-red)]" />
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight">Crea allergene</div>
              <div className="text-xs text-black/50">Apri per inserire IT/EN</div>
            </div>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-black/10">
            <span className="group-open:hidden text-xl leading-none">+</span>
            <span className="hidden group-open:inline text-xl leading-none">−</span>
          </span>
        </summary>

        <div className="px-4 pb-4">
          <form action={createAllergen} className="grid gap-3 md:grid-cols-[1fr_1fr_160px]">
            <label className="block min-w-0">
              <span className="text-xs font-medium text-black/70">Nome (IT)</span>
              <input
                name="label_it"
                className="mt-1 w-full min-w-0 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                placeholder="Glutine"
              />
            </label>

            <label className="block min-w-0">
              <span className="text-xs font-medium text-black/70">Nome (EN)</span>
              <input
                name="label_en"
                className="mt-1 w-full min-w-0 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                placeholder="Gluten"
              />
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

      {/* LISTA */}
      <div className="mt-6 space-y-3">
        {allergens.map((a) => {
          const it = (a.label_it ?? "").trim() || "—";
          const en = (a.label_en ?? "").trim() || "—";

          return (
            <details key={a.id} className="group rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
              <summary className="list-none cursor-pointer px-4 py-4 flex items-center justify-between gap-3 [&::-webkit-details-marker]:hidden hover:bg-black/[0.02] transition">
                <div className="min-w-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3 min-w-0">
                    <div className="text-sm sm:text-base font-semibold text-black/90 truncate">
                      {it}
                    </div>
                    <div className="hidden sm:block h-1 w-1 rounded-full bg-black/20" />
                    <div className="text-sm sm:text-base text-black/60 truncate">{en}</div>
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

                <form action={updateAllergen} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_240px]">
                  <input type="hidden" name="id" value={a.id} />

                  <label className="block min-w-0">
                    <span className="text-xs font-medium text-black/70">Nome (IT)</span>
                    <input
                      name="label_it"
                      defaultValue={a.label_it ?? ""}
                      className="mt-1 w-full min-w-0 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                    />
                  </label>

                  <label className="block min-w-0">
                    <span className="text-xs font-medium text-black/70">Nome (EN)</span>
                    <input
                      name="label_en"
                      defaultValue={a.label_en ?? ""}
                      className="mt-1 w-full min-w-0 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2 md:items-end">
                    <button
                      type="submit"
                      className="h-[42px] rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
                    >
                      Salva
                    </button>

                    <button
                      type="submit"
                      formAction={deleteAllergen}
                      className="h-[42px] rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-red-200 text-red-700 hover:bg-red-50"
                    >
                      Elimina
                    </button>
                  </div>
                </form>
              </div>
            </details>
          );
        })}

        {allergens.length === 0 ? (
          <div className="rounded-2xl bg-white ring-1 ring-black/5 px-4 py-6 text-sm text-black/55">
            Nessun allergene ancora. Crea il primo da “Crea allergene”.
          </div>
        ) : null}
      </div>
    </div>
  );
}
