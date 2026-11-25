"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, House, LayoutGrid, Search, Sunrise } from "lucide-react";
import { isActivePath, isReaderPath } from "@/lib/nav";

const ITEMS = [
  { href: "/", label: "হোম", icon: House },
  { href: "/quran/", label: "কুরআন", icon: BookOpen },
  { href: "/amal/", label: "আমল", icon: Sunrise },
  { href: "/search/", label: "সার্চ", icon: Search },
  { href: "/more/", label: "আরও", icon: LayoutGrid },
];

/** Floating tab bar on phones (hidden while reading). Large screens use SiteHeader instead. */
export function AppNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="প্রধান মেনু"
      className={`fixed inset-x-3.5 bottom-[calc(0.875rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md rounded-full border border-line-strong bg-surface-2 shadow-[0_14px_34px_rgba(0,0,0,0.35)] lg:hidden ${isReaderPath(pathname) ? "hidden" : ""}`}
    >
      <ul className="grid grid-cols-5 px-1">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActivePath(href, pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-[4.375rem] flex-col items-center justify-center gap-0.5 text-xs ${active ? "font-semibold text-accent" : "text-muted"}`}
              >
                <Icon aria-hidden className="size-[1.375rem]" strokeWidth={active ? 2.4 : 1.7} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
