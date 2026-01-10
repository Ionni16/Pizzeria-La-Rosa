import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/auth";
import TagForm from "../_components/TagForm";
import { updateTagAction } from "../_actions";

type TagRow = { id: string; label_it: string; label_en: string };

export default async function EditTagPage({
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

  const { data: tag, error } = await supabase
    .from("tags")
    .select("id,label_it,label_en")
    .eq("id", id)
    .single<TagRow>();

  if (error || !tag) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tag non trovato</h1>
        <Link href="/admin/tags" className="mt-6 inline-block rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-black/10 hover:bg-black/5">
          ← Torna ai tag
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

      <h1 className="text-2xl font-semibold tracking-tight">Modifica tag</h1>

      <TagForm
        initial={{ label_it: tag.label_it, label_en: tag.label_en }}
        action={updateTagAction.bind(null, id)}
        submitLabel="Salva modifiche"
      />
    </div>
  );
}
