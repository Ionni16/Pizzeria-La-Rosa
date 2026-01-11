import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";

type TagRow = {
  id: string;
  label_it: string | null;
  label_en: string | null;
};

function toText(value: FormDataEntryValue | null) {
  const s = String(value ?? "").trim();
  return s.length ? s : null;
}

export default async function TagsAdminPage() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("tags")
    .select("id,label_it,label_en")
    .order("label_it", { ascending: true });

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tag</h1>
        <p className="mt-3 text-sm text-red-700">Errore caricando i tag: {error.message}</p>
      </div>
    );
  }

  const tags = (data ?? []) as TagRow[];

  async function createTag(formData: FormData) {
    "use server";
    const { supabase } = await requireAdmin();

    const label_it = toText(formData.get("label_it"));
    const label_en = toText(formData.get("label_en"));
    if (!label_it && !label_en) return;

    const { error } = await supabase.from("tags").insert({ label_it, label_en });
    if (error) throw new Error(error.message);

    revalidatePath("/admin/tags");
    revalidatePath("/admin/dishes");
    revalidatePath("/");
  }

  async function updateTag(formData: FormData) {
    "use server";
    const { supabase } = await requireAdmin();

    const id = String(formData.get("id") ?? "").trim();
    if (!id) return;

    const label_it = toText(formData.get("label_it"));
    const label_en = toText(formData.get("label_en"));
    if (!label_it && !label_en) return;

    const { error } = await supabase.from("tags").update({ label_it, label_en }).eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/tags");
    revalidatePath("/admin/dishes");
    revalidatePath("/");
  }

  async function deleteTag(formData: FormData) {
    "use server";
    const { supabase } = await requireAdmin();

    const id = String(formData.get("id") ?? "").trim();
    if (!id) return;

    const { error } = await supabase.from("tags").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/tags");
    revalidatePath("/admin/dishes");
    revalidatePath("/");
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tag</h1>
          <p className="mt-1 text-sm text-black/60">Vedi lista pulita. Premi “Modifica” per cambiare o eliminare.</p>
        </div>
        <div className="text-sm text-black/50">{tags.length} tag</div>
      </div>

      {/* CREA */}
      <details className="mt-6 group rounded-2xl bg-[rgb(252,250,246)] ring-1 ring-black/5 overflow-hidden">
        <summary className="list-none cursor-pointer px-4 py-4 flex items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[color:var(--brand-red)]" />
            <div>
              <div className="text-sm font-semibold tracking-tight">Crea tag</div>
              <div className="text-xs text-black/50">Apri per inserire IT/EN</div>
            </div>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-black/10">
            <span className="group-open:hidden text-xl leading-none">+</span>
            <span className="hidden group-open:inline text-xl leading-none">−</span>
          </span>
        </summary>

        <div className="px-4 pb-4">
          <form action={createTag} className="grid gap-3 md:grid-cols-[1fr_1fr_160px]">
            <label className="block">
              <span className="text-xs font-medium text-black/70">Nome (IT)</span>
              <input
                name="label_it"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                placeholder="Vegetariana"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-black/70">Nome (EN)</span>
              <input
                name="label_en"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                placeholder="Vegetarian"
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
        {tags.map((t) => {
          const it = (t.label_it ?? "").trim();
          const en = (t.label_en ?? "").trim();
          const showIt = it || "—";
          const showEn = en || "—";

          return (
            <details key={t.id} className="group rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
              {/* ROW compatta */}
              <summary className="list-none cursor-pointer px-4 py-4 flex items-center justify-between gap-3 [&::-webkit-details-marker]:hidden hover:bg-black/[0.02] transition">
                <div className="min-w-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <div className="text-sm sm:text-base font-semibold text-black/90 truncate">{showIt}</div>
                    <div className="hidden sm:block h-1 w-1 rounded-full bg-black/20" />
                    <div className="text-sm sm:text-base text-black/60 truncate">{showEn}</div>
                  </div>
                </div>

                <div className="shrink-0 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-black/10 bg-[rgb(252,250,246)] group-open:bg-white">
                  Modifica
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </div>
              </summary>

              {/* EDIT */}
              <div className="px-4 pb-4">
                <div className="mt-2 h-px bg-black/10" />

                <form action={updateTag} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_190px]">
                  <input type="hidden" name="id" value={t.id} />

                  <label className="block">
                    <span className="text-xs font-medium text-black/70">Nome (IT)</span>
                    <input
                      name="label_it"
                      defaultValue={t.label_it ?? ""}
                      className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-black/70">Nome (EN)</span>
                    <input
                      name="label_en"
                      defaultValue={t.label_en ?? ""}
                      className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                    />
                  </label>

                  <div className="flex gap-2 md:items-end">
                    <button
                      type="submit"
                      className="flex-1 h-[42px] rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
                    >
                      Salva
                    </button>

                    <form action={deleteTag} className="contents">
                      <input type="hidden" name="id" value={t.id} />
                      <button
                        type="submit"
                        className="h-[42px] rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-red-200 text-red-700 hover:bg-red-50"
                      >
                        Elimina
                      </button>
                    </form>
                  </div>
                </form>
              </div>
            </details>
          );
        })}

        {tags.length === 0 ? (
          <div className="rounded-2xl bg-white ring-1 ring-black/5 px-4 py-6 text-sm text-black/55">
            Nessun tag ancora. Crea il primo da “Crea tag”.
          </div>
        ) : null}
      </div>
    </div>
  );
}
