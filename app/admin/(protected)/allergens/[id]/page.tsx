import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/auth";
import AllergenForm from "../_components/AllergenForm";
import { updateAllergenAction } from "../_actions";

type AllergenRow = { id: string; code: string | null; label_it: string; label_en: string };

export default async function EditAllergenPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;

  const sp = (await searchParams) ?? {};
  const saved = sp.saved === "1";

  const { data: allergen, error } = await supabase
    .from("allergens")
    .select("id,code,label_it,label_en")
    .eq("id", id)
    .single<AllergenRow>();

  if (error || !allergen) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Allergene non trovato</h1>
        <Link href="/admin/allergens" className="mt-6 inline-block rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-black/10 hover:bg-black/5">
          ← Torna agli allergeni
        </Link>
      </div>
    );
  }

  return (
    <div>
      {saved ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Salvato ✅
        </div>
      ) : null}

      <h1 className="text-2xl font-semibold tracking-tight">Modifica allergene</h1>

      <AllergenForm
        initial={{ code: allergen.code ?? "", label_it: allergen.label_it, label_en: allergen.label_en }}
        action={updateAllergenAction.bind(null, id)}
        submitLabel="Salva modifiche"
      />
    </div>
  );
}
