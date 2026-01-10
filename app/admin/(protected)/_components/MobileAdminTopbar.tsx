"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/app/admin/signout/SignOutButton";

export default function MobileAdminTopbar({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const items = [
    { href: "/admin/dishes", label: "Piatti", primary: true },
    { href: "/admin/categories", label: "Categorie" },
    { href: "/admin/allergens", label: "Allergeni" },
    { href: "/admin/tags", label: "Tag" },
  ];

  return (
    <>
      {/* TOPBAR */}
      <div className="md:hidden mb-4 rounded-2xl bg-white ring-1 ring-black/5 p-3 flex justify-between">
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-black/10"
        >
          ☰ Menu
        </button>

        <div className="text-center">
          <div className="text-sm font-semibold">Admin</div>
          <div className="text-xs text-black/50 truncate">{email}</div>
        </div>

        <SignOutButton />
      </div>

      {/* DRAWER */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute left-0 top-0 h-full w-[85%] bg-white p-4">
            <nav className="space-y-2">
              {items.map((i) => {
                const active = pathname.startsWith(i.href);
                return (
                  <Link
                    key={i.href}
                    href={i.href}
                    onClick={() => setOpen(false)}
                    className={[
                      "block rounded-xl px-4 py-3 text-base font-semibold",
                      i.primary
                        ? active
                          ? "bg-black text-white"
                          : "bg-black/5"
                        : active
                        ? "bg-black/5"
                        : "",
                    ].join(" ")}
                  >
                    {i.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-xl px-4 py-3 ring-1 ring-black/10"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
