import { requireAdmin } from "@/lib/supabase/auth";
import TagForm from "../_components/TagForm";
import { createTagAction } from "../_actions";

export default async function NewTagPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Nuovo tag</h1>
      <TagForm initial={{ label_it: "", label_en: "" }} action={createTagAction} submitLabel="Salva tag" />
    </div>
  );
}
