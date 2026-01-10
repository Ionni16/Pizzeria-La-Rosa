import Link from "next/link";

export type TagInitial = {
  label_it: string;
  label_en: string;
};

export default function TagForm({
  initial,
  action,
  submitLabel,
}: {
  initial: TagInitial;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="mt-6 space-y-6">
      <section className="rounded-2xl ring-1 ring-black/5 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-black/70">Etichetta (IT) *</span>
            <input
              name="label_it"
              required
              defaultValue={initial.label_it}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
              placeholder="es. vegetariano"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-black/70">Etichetta (EN) *</span>
            <input
              name="label_en"
              required
              defaultValue={initial.label_en}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
              placeholder="e.g. vegetarian"
            />
          </label>
        </div>

        <p className="mt-3 text-[11px] text-black/45">
          I tag sono bilingue e vengono mostrati come “chip” nel menu clienti.
        </p>
      </section>

      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/tags"
          className="rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-black/10 hover:bg-black/5"
        >
          ← Torna ai tag
        </Link>

        <button
          type="submit"
          className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-black/90"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
