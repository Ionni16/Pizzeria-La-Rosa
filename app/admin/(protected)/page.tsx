// app/admin/page.tsx
import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Pannello Admin</h1>
        <p className="mt-1 text-black/60">
          Gestisci categorie e piatti. Le modifiche sono immediate sul menu pubblico.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/dishes"
          className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm hover:shadow transition"
        >
          <div className="text-lg font-semibold">Piatti</div>
          <div className="mt-1 text-sm text-black/60">
            Aggiungi / modifica / rimuovi piatti e immagini.
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm hover:shadow transition"
        >
          <div className="text-lg font-semibold">Categorie</div>
          <div className="mt-1 text-sm text-black/60">
            Crea categorie, ordinale e attivale/disattivale.
          </div>
        </Link>
      </div>
    </div>
  );
}
