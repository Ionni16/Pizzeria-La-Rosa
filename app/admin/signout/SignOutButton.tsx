"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = React.useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        try {
          setLoading(true);
          await supabase.auth.signOut();
          router.refresh();
          router.push("/admin/login");
        } finally {
          setLoading(false);
        }
      }}
      className="rounded-xl px-3 py-2 text-xs font-medium ring-1 ring-black/10 bg-white hover:bg-black/[0.03] transition disabled:opacity-60"
      aria-label="Logout"
      title="Logout"
    >
      {loading ? "..." : "Logout"}
    </button>
  );
}
