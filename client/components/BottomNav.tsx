"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const baseItems = [
  { href: "/", label: "Scan" },
  { href: "/ranking", label: "Ranks" },
  { href: "/badges", label: "Badges" },
  { href: "/profile", label: "Profile" },
];

// Pestaña extra solo para artistas
const artistItem = { href: "/my-art", label: "Art" };

export default function BottomNav() {
  const pathname = usePathname();
  const { status, isArtist } = useAuth();

  // Sin barra en la sala (pantalla completa) ni en login/registro (aún no hay sesión)
  const hiddenOn = ["/room", "/login", "/register"];
  if (status !== "authenticated") return null;
  if (hiddenOn.some((path) => pathname.startsWith(path))) return null;

  const items = isArtist
    ? [...baseItems.slice(0, 3), artistItem, ...baseItems.slice(3)]
    : baseItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-arena-border bg-arena-surface">
      <ul className="mx-auto flex max-w-md justify-around">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-3 py-3 text-xs tracking-widest ${
                  active ? "text-neon-pink" : "text-arena-muted"
                }`}
              >
                {item.label.toUpperCase()}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}