import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/auth";
import { deleteAllergenAction } from "./_actions";

type AllergenRow = { id: string; code: string | null; label_it: string; label_en: string; created_at: string };

export default async function AdminAllergensPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? "").trim().toLowerCase();

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("allergens")
    .select("id,code,label_it,label_en,created_at")
    .order("label_it", { ascending: true })
    .returns<AllergenRow[]>();

  if (error) return <div className="text-sm text-red-700">Errore: {error.message}</div>;

  let rows = data ?? [];
  if (q) {
    rows = rows.filter((a) => `${a.code ?? ""} ${a.label_it} ${a.label_en}`.toLowerCase().includes(q));
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">ALLERGENI</h1>
          <p className="mt-1 text-sm text-black/60">Bilingue IT/EN. Codice opzionale (unico).</p>
        </div>

        <Link
          href="/admin/allergens/new"
          className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black/90"
        >
          + Nuovo allergene
        </Link>
      </div>

      <div className="mt-6 rounded-2xl ring-1 ring-black/5 bg-[rgb(252,250,246)] p-4">
        <form className="grid gap-3 sm:grid-cols-3 sm:items-end">
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-black/70">Cerca</span>
            <input
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="es. glutine / gluten / 1…"
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
            />
          </label>
          <button className="rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-black/10 bg-white hover:bg-black/5">
            Applica
          </button>
        </form>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-black/5 bg-white">
        <div className="divide-y divide-black/10">
          {rows.map((a) => (
            <div key={a.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[16px] font-semibold tracking-tight">
                  <span className="text-black/60 tabular-nums">{a.code ? `${a.code}` : "—"}</span>
                  <span className="text-black/40"> · </span>
                  {a.label_it}
                  <span className="text-black/40"> · </span>
                  <span className="text-black/70">{a.label_en}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/allergens/${a.id}`}
                  className="rounded-xl px-3 py-2 text-xs font-semibold ring-1 ring-black/10 hover:bg-black/5"
                >
                  Modifica
                </Link>

                <form action={async () => { "use server"; await deleteAllergenAction(a.id); }}>
                  <button className="rounded-xl px-3 py-2 text-xs font-semibold ring-1 ring-red-200 text-red-700 hover:bg-red-50">
                    Elimina
                  </button>
                </form>
              </div>
            </div>
          ))}

          {rows.length === 0 && <div className="px-4 py-10 text-sm text-black/55">Nessun allergene trovato.</div>}
        </div>
      </div>
    </div>
  );
}
