"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/hotels", label: "Hôtels" },
  { href: "/activities", label: "Activités" },
  { href: "/destinations", label: "Destinations" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-base/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Immersive<span className="text-primary">.</span>
        </Link>
        <ul className="flex items-center gap-8">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "text-sm font-medium text-text-secondary transition-colors hover:text-text-primary",
                    active && "text-text-primary"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
