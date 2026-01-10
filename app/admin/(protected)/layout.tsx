// app/admin/(protected)/layout.tsx
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/supabase/auth";
import DesktopSidebar from "./_components/DesktopSidebar";
import MobileAdminTopbar from "./_components/MobileAdminTopbar";

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireAdmin();

  return (
    <div className="min-h-screen bg-[rgb(250,248,242)]">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-6">
        {/* MOBILE */}
        <MobileAdminTopbar email={profile.email ?? "admin"} />

        <div className="grid gap-4 md:grid-cols-[240px_1fr]">
          {/* DESKTOP */}
          <DesktopSidebar email={profile.email ?? "admin"} />

          <main className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
