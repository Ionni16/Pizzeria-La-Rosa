"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/app/admin/signout/SignOutButton";

type Item = { href: string; label: string; primary?: boolean };

export default function MobileAdminTopbar({ email }: { email: string }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  const items: Item[] = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/categories", label: "Categorie" },
    { href: "/admin/dishes", label: "Piatti", primary: true },
    { href: "/admin/allergens", label: "Allergeni" },
    { href: "/admin/tags", label: "Tag" },
  ];

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* TOPBAR MOBILE (più “alta” e premium) */}
      <div className="md:hidden sticky top-2 z-20">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[rgb(252,250,246)] px-4 text-sm font-semibold ring-1 ring-black/10 hover:bg-black/5"
              aria-label="Apri menu admin"
            >
              <span className="text-lg leading-none">≡</span>
              Menu
            </button>

            <div className="min-w-0 text-center">
              <div className="text-[15px] font-semibold leading-none tracking-tight">Admin</div>
              <div className="mt-1 max-w-[170px] truncate text-[12px] text-black/55">
                {email}
              </div>
            </div>

            <div className="shrink-0">
              {/* bottone logout già tuo */}
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>

      {/* DRAWER */}
      {open ? (
        <div className="md:hidden fixed inset-0 z-30">
          {/* overlay */}
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Chiudi menu"
            onClick={() => setOpen(false)}
          />

          {/* panel */}
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-2xl">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-semibold tracking-tight">Menu Admin</div>
                  <div className="mt-1 truncate text-sm text-black/55">{email}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-10 rounded-xl bg-[rgb(252,250,246)] px-3 text-sm font-semibold ring-1 ring-black/10 hover:bg-black/5"
                  aria-label="Chiudi"
                >
                  ✕
                </button>
              </div>

              <nav className="mt-5 space-y-1">
                {items.map((it) => {
                  const active = isActive(it.href);
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      onClick={() => setOpen(false)}
                      className={[
                        "flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-semibold transition",
                        it.primary
                          ? active
                            ? "bg-black text-white"
                            : "bg-black/5 text-black hover:bg-black/10"
                          : active
                          ? "bg-[rgb(252,250,246)] ring-1 ring-black/10"
                          : "text-black/80 hover:bg-black/5",
                      ].join(" ")}
                    >
                      <span>{it.label}</span>
                      <span
                        className={
                          active
                            ? "h-2 w-2 rounded-full bg-[color:var(--brand-red)]"
                            : "h-2 w-2"
                        }
                      />
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
