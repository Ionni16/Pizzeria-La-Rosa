"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSignOutButton from "./AdminSignOutButton";

type NavItem = { href: string; label: string; kind?: "primary" | "normal" };

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/categories", label: "Categorie" },
  { href: "/admin/dishes", label: "Piatti", kind: "primary" }, // evidenza
  { href: "/admin/allergens", label: "Allergeni" },
  { href: "/admin/tags", label: "Tag" },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavList({
  onNavigate,
  variant,
}: {
  onNavigate?: () => void;
  variant: "desktop" | "mobile";
}) {
  const pathname = usePathname();

  return (
    <nav className="mt-4 space-y-1">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        const primary = item.kind === "primary";

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cx(
              "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition",
              primary
                ? active
                  ? "bg-black text-white"
                  : "bg-black/5 text-black hover:bg-black/10"
                : active
                  ? "bg-white ring-1 ring-black/10"
                  : "text-black/75 hover:bg-black/5",
              variant === "mobile" && "text-base py-3"
            )}
          >
            <span>{item.label}</span>

            {/* pallino brand quando attivo */}
            <span
              className={cx(
                "h-2 w-2 rounded-full",
                active ? "bg-[color:var(--brand-red)]" : "bg-transparent"
              )}
              aria-hidden="true"
            />
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminSidebar({
  email,
}: {
  email?: string | null;
}) {
  const [open, setOpen] = React.useState(false);

  // chiudi con ESC
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* TOP BAR (solo mobile) */}
      <div className="lg:hidden sticky top-0 z-20 bg-[rgb(252,250,246)]/90 backdrop-blur border-b border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-black/10 hover:bg-black/5"
            aria-label="Apri menu admin"
          >
            <span className="text-lg leading-none">≡</span>
            Menu
          </button>

          <div className="text-sm font-semibold tracking-tight">
            Pannello Admin
          </div>

          <div className="shrink-0">
            <AdminSignOutButton />
          </div>
        </div>
      </div>

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-4 rounded-2xl bg-white ring-1 ring-black/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-base font-semibold tracking-tight">
                Pannello Admin
              </div>
              {email ? (
                <div className="mt-1 text-sm text-black/55 truncate">{email}</div>
              ) : null}
            </div>
            <AdminSignOutButton />
          </div>

          {/* niente suggerimento */}
          <NavList variant="desktop" />
        </div>
      </aside>

      {/* DRAWER MOBILE */}
      {open ? (
        <div className="lg:hidden fixed inset-0 z-30">
          {/* overlay */}
          <button
            className="absolute inset-0 bg-black/40"
            aria-label="Chiudi menu"
            onClick={() => setOpen(false)}
            type="button"
          />

          {/* panel */}
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm bg-[rgb(252,250,246)] shadow-2xl">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-semibold tracking-tight">
                    Pannello Admin
                  </div>
                  {email ? (
                    <div className="mt-1 text-sm text-black/55 truncate">{email}</div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-black/10 hover:bg-black/5"
                  aria-label="Chiudi"
                >
                  ✕
                </button>
              </div>

              <NavList
                variant="mobile"
                onNavigate={() => setOpen(false)} // chiude quando selezioni
              />

              <div className="mt-6">
                <AdminSignOutButton fullWidth />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
