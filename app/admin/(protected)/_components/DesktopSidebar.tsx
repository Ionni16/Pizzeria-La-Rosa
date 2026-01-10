// app/admin/(protected)/_components/DesktopSidebar.tsx
import Link from "next/link";
import SignOutButton from "@/app/admin/signout/SignOutButton";

export default function DesktopSidebar({ email }: { email: string }) {
  return (
    <aside className="hidden md:block rounded-2xl bg-white ring-1 ring-black/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">Pannello Admin</div>
          <div className="text-xs text-black/50 truncate">{email}</div>
        </div>
        <SignOutButton />
      </div>

      <nav className="mt-4 space-y-1">
        <NavLink href="/admin">Dashboard</NavLink>
        <div className="my-3 h-px bg-black/10" />
        <NavLink href="/admin/categories">Categorie</NavLink>
        <NavLink href="/admin/dishes" emphasis>Piatti</NavLink>
        <NavLink href="/admin/allergens">Allergeni</NavLink>
        <NavLink href="/admin/tags">Tag</NavLink>
      </nav>
    </aside>
  );
}

function NavLink({
  href,
  children,
  emphasis,
}: {
  href: string;
  children: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "block rounded-xl px-3 py-2 text-sm font-medium transition",
        "hover:bg-black/5",
        emphasis ? "bg-black/5 font-semibold" : "",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
