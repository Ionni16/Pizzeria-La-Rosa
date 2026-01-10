// app/admin/(protected)/dishes/_components/DishForm.tsx
import Link from "next/link";
import DishImageUploader from "./DishImageUploader";
import ChipListSelect from "./ChipListSelect";




type Category = {
  id: string;
  name_it: string | null;
  name_en: string | null;
  position: number | null;
  is_active?: boolean | null;
};

type Tag = { id: string; label_it: string | null; label_en: string | null };
type Allergen = { id: string; code: string | null; label_it: string | null; label_en: string | null };


export type DishInitial = {
  id?: string;
  category_id: string;
  name_it: string | null;
  name_en: string | null;
  description_it: string | null;
  description_en: string | null;
  price_eur: number | null;
  quantity: number | null; // ✅
  position: number | null;
  is_available: boolean | null;
  is_daily_special: boolean | null;
  image_url: string | null;
  selected_tag_ids: string[];
  selected_allergen_ids: string[];
};

export default function DishForm({
  mode,
  categories,
  tags,
  allergens,
  initial,
  action,
  submitLabel,
}: {
  mode: "create" | "edit";
  categories: Category[];
  tags: Tag[];
  allergens: Allergen[];
  initial: DishInitial;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}) {
  const title = mode === "create" ? "Nuovo piatto" : "Modifica piatto";

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-black/60">
            Tutto in un posto: IT/EN, categoria, posizione, visibilità, tag/allergeni, quantità e foto.
          </p>
        </div>
      </div>

      <form action={action} className="mt-6 space-y-6">
        {/* META: categoria/pos/flags */}
        {/* META: categoria / posizione / visibilità */}
        <section className="rounded-2xl ring-1 ring-black/5 bg-[rgb(252,250,246)] p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
            {/* Categoria */}
            <label className="block">
              <span className="text-xs font-medium text-black/70">Categoria</span>
              <select
                name="category_id"
                defaultValue={initial.category_id}
                required
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none
                          focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_it ?? c.name_en ?? "Senza nome"}
                  </option>
                ))}
              </select>
            </label>

            {/* Posizione */}
            <label className="block">
              <span className="text-xs font-medium text-black/70">Posizione</span>
              <input
                name="position"
                inputMode="numeric"
                defaultValue={String(initial.position ?? 0)}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-right outline-none
                          focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
              />
            </label>

            {/* Visibile */}
            <label className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 ring-1 ring-black/10 h-[42px] sm:self-end">
              <input
                name="is_available"
                type="checkbox"
                defaultChecked={!!initial.is_available}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-black/75">
                Visibile ai clienti
              </span>
            </label>
          </div>

          {/* Hint sotto, allineato e non rompe la griglia */}
          <p className="mt-2 text-[11px] text-black/45">
            Posizione: 0 = in cima, poi 1, 2, 3…
          </p>
        </section>


        {/* NOME + PREZZO + QUANTITÀ */}
        <section className="rounded-2xl ring-1 ring-black/5 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block sm:col-span-1">
              <span className="text-xs font-medium text-black/70">Nome (IT)</span>
              <input
                name="name_it"
                defaultValue={initial.name_it ?? ""}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                placeholder="Margherita"
              />
            </label>

            <label className="block sm:col-span-1">
              <span className="text-xs font-medium text-black/70">Nome (EN)</span>
              <input
                name="name_en"
                defaultValue={initial.name_en ?? ""}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                placeholder="Margherita"
              />
            </label>

            <div className="grid grid-cols-2 gap-3 sm:col-span-1">
              <label className="block">
                <span className="text-xs font-medium text-black/70">Prezzo (€)</span>
                <input
                  name="price_eur"
                  inputMode="decimal"
                  defaultValue={String(initial.price_eur ?? 0)}
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                  placeholder="10.00"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-black/70">Quantità</span>
                <input
                  name="quantity"
                  inputMode="numeric"
                  defaultValue={String(initial.quantity ?? "")}
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                  placeholder="(vuoto = illimitato)"
                />
              </label>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-black/45">
            Quantità: se la lasci vuota, consideriamo “illimitato”.
          </p>
        </section>

        {/* DESCRIZIONI */}
        <section className="rounded-2xl ring-1 ring-black/5 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-black/70">Descrizione (IT)</span>
              <textarea
                name="description_it"
                defaultValue={initial.description_it ?? ""}
                rows={4}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                placeholder="Pomodoro, mozzarella, basilico…"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-black/70">Descrizione (EN)</span>
              <textarea
                name="description_en"
                defaultValue={initial.description_en ?? ""}
                rows={4}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30"
                placeholder="Tomato, mozzarella, basil…"
              />
            </label>
          </div>
        </section>

        
        {/* TAG + ALLERGENI (lista completa, no ricerca) */}
        <section className="rounded-2xl ring-1 ring-black/5 bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ChipListSelect
              title="TAG"
              hint="Tocca per selezionare o deselezionare."
              name="tag_ids"
              items={tags}
              defaultSelectedIds={initial.selected_tag_ids}
              maxHeightClass="max-h-72"
            />

            <ChipListSelect
              title="ALLERGENI"
              hint="Tocca per selezionare o deselezionare."
              name="allergen_ids"
              items={allergens}
              defaultSelectedIds={initial.selected_allergen_ids}
              showCode
              maxHeightClass="max-h-72"
            />
          </div>
        </section>



        
        {/* FOTO (opzionale) — premium e pulita */}
        <section className="rounded-2xl ring-1 ring-black/5 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold tracking-tight">FOTO</div>
              <p className="mt-1 text-xs text-black/50">Opzionale. Carica o incolla un link.</p>
            </div>
          </div>

          <div className="mt-4">
            <DishImageUploader initialUrl={initial.image_url} inputName="image_url" />
          </div>
        </section>

        {/* CTA */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/admin/dishes"
            className="rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-black/10 hover:bg-black/[0.03]"
          >
            ← Torna ai piatti
          </Link>

          <button
            type="submit"
            className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-black/90"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
