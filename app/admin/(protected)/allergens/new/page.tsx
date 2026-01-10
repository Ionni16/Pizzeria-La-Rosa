import { requireAdmin } from "@/lib/supabase/auth";
import AllergenForm from "../_components/AllergenForm";
import { createAllergenAction } from "../_actions";

export default async function NewAllergenPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Nuovo allergene</h1>
      <AllergenForm
        initial={{ code: "", label_it: "", label_en: "" }}
        action={createAllergenAction}
        submitLabel="Salva allergene"
      />
    </div>
  );
}
