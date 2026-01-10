"use client";

import * as React from "react";
import DishImageUploader from "./DishImageUploader";

type Category = { id: string; name_it: string; name_en: string | null };

type Props = {
  mode: "create" | "edit";
  categories: Category[];
  action: (fd: FormData) => Promise<void>;
  initial?: {
    id?: string;
    category_id: string;
    name_it: string;
    name_en: string | null;
    description_it: string | null;
    description_en: string | null;
    price_eur: number | null;
    position: number | null;
    is_available: boolean;
    image_url: string | null;
  };
};

export default function DishForm({ mode, categories, action, initial }: Props) {
  const d = initial;

  const [imageUrl, setImageUrl] = React.useState<string | null>(d?.image_url ?? null);

  return (
    <form action={action} className="space-y-5">
      {mode === "edit" && d?.id ? <input type="hidden" name="id" value={d.id} /> : null}

      <input type="hidden" name="image_url" value={imageUrl ?? ""} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Nome IT</label>
          <input
            name="name_it"
            required
            defaultValue={d?.name_it ?? ""}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Nome EN</label>
          <input
            name="name_en"
            defaultValue={d?.name_en ?? ""}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Descrizione IT</label>
          <textarea
            name="description_it"
            rows={3}
            defaultValue={d?.description_it ?? ""}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Descrizione EN</label>
          <textarea
            name="description_en"
            rows={3}
            defaultValue={d?.description_en ?? ""}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium">Categoria</label>
          <select
            name="category_id"
            required
            defaultValue={d?.category_id ?? (categories[0]?.id ?? "")}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_it}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Prezzo (€)</label>
          <input
            name="price_eur"
            inputMode="decimal"
            defaultValue={d?.price_eur != null ? String(d.price_eur) : "0"}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Position</label>
          <input
            name="position"
            inputMode="numeric"
            defaultValue={d?.position != null ? String(d.position) : "0"}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_available" defaultChecked={d?.is_available ?? true} className="h-4 w-4" />
          Disponibile
        </label>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
        <div className="text-sm font-semibold">Immagine</div>
        <div className="mt-3">
          <DishImageUploader value={imageUrl} onChange={setImageUrl} />
        </div>
        <p className="mt-3 text-xs text-black/60">
          Se non carichi nulla, il piatto non mostrerà alcuna immagine (layout pulito).
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button className="rounded-xl bg-[color:var(--brand-red)] px-5 py-2 font-semibold text-white shadow-sm hover:opacity-95">
          {mode === "create" ? "Crea piatto" : "Salva modifiche"}
        </button>
      </div>
    </form>
  );
}
