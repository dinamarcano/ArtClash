"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Scan" },
  { href: "/ranking", label: "Ranks" },
  { href: "/badges", label: "Badges" },
  { href: "/profile", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/room")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-arena-border bg-arena-surface">
      <ul className="mx-auto flex max-w-md justify-around">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-4 py-3 text-xs tracking-widest ${
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