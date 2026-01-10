// app/admin/login/page.tsx
import { redirect } from "next/navigation";
import { getOptionalAdmin } from "@/lib/supabase/auth";
import LoginForm from "@/app/admin/login/LoginForm";


export default async function AdminLoginPage() {
  const { profile } = await getOptionalAdmin();

  if (profile?.is_admin) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[rgb(250,248,242)]">
      <div className="mx-auto max-w-md px-4 py-14">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-6">
          <h1 className="text-2xl font-semibold tracking-tight">Area Gestione</h1>
          <p className="mt-1 text-sm text-black/60">
            Accedi per modificare menu, piatti, allergeni e tag.
          </p>

          <div className="mt-6">
            <LoginForm />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-black/40">
          Accesso riservato ai gestori.
        </p>
      </div>
    </main>
  );
}
