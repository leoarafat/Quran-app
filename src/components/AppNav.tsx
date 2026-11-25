"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, House, LayoutGrid, Search, Sunrise } from "lucide-react";
import { isActivePath } from "@/lib/nav";

const ITEMS = [
  { href: "/", label: "হোম", icon: House },
  { href: "/quran/", label: "কুরআন", icon: BookOpen },
  { href: "/amal/", label: "আমল", icon: Sunrise },
  { href: "/search/", label: "সার্চ", icon: Search },
  { href: "/more/", label: "আরও", icon: LayoutGrid },
];

/** Bottom tab bar on phones, side rail on large screens. */
export function AppNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="প্রধান মেনু"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:inset-y-0 lg:right-auto lg:w-56 lg:border-r lg:border-t-0"
    >
      <p className="hidden px-6 pb-4 pt-6 text-2xl font-bold text-brand lg:block">নূর কুরআন</p>
      <ul className="grid grid-cols-5 lg:flex lg:flex-col lg:gap-1 lg:px-3">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActivePath(href, pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-0.5 text-[0.8125rem] lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-xl lg:px-3 lg:text-base ${
                  active ? "font-semibold text-brand lg:bg-surface-2" : "text-muted"
                }`}
              >
                <span className={`rounded-full px-4 py-0.5 lg:p-0 ${active ? "bg-accent-soft lg:bg-transparent" : ""}`}>
                  <Icon aria-hidden className="size-6" strokeWidth={active ? 2.4 : 1.8} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
