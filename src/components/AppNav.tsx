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

/** Floating tab bar on phones (hidden while reading), side rail on large screens. */
export function AppNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="প্রধান মেনু"
      className={`fixed inset-x-3.5 bottom-[calc(0.875rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md rounded-full border border-line-strong bg-surface-2 shadow-[0_14px_34px_rgba(0,0,0,0.35)] lg:inset-y-0 lg:left-0 lg:right-auto lg:mx-0 lg:block lg:w-56 lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-line lg:shadow-none ${isReaderPath(pathname) ? "hidden" : ""}`}
    >
      <p className="hidden px-6 pb-5 pt-7 font-display text-2xl font-bold text-accent lg:block">নূর কুরআন</p>
      <ul className="grid grid-cols-5 px-1 lg:flex lg:flex-col lg:gap-1 lg:px-3">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActivePath(href, pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-[4.375rem] flex-col items-center justify-center gap-0.5 text-xs lg:h-12 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-2xl lg:px-4 lg:text-base ${
                  active ? "font-semibold text-accent lg:bg-active" : "text-muted"
                }`}
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
