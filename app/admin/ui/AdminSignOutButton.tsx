"use client";

import * as React from "react";
import { signOutAction } from "./actions";

export default function AdminSignOutButton({ fullWidth }: { fullWidth?: boolean }) {
  const [pending, startTransition] = React.useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(async () => { await signOutAction(); })}
      disabled={pending}
      className={[
        "rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-black/10 hover:bg-black/5 disabled:opacity-60",
        fullWidth ? "w-full" : "",
      ].join(" ")}
    >
      Logout
    </button>
  );
}
