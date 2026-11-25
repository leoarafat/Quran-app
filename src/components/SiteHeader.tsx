"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Search, Settings } from "lucide-react";
import { isActivePath, isReaderPath } from "@/lib/nav";

const LINKS = [
  { href: "/", label: "হোম" },
  { href: "/quran/", label: "কুরআন" },
  { href: "/hadith/", label: "হাদিস" },
  { href: "/namaz/", label: "নামাজ শিক্ষা" },
  { href: "/arabic/", label: "আরবি শিখুন" },
  { href: "/amal/", label: "দোয়া ও আমল" },
  { href: "/prayer-times/", label: "নামাজের সময়" },
];

const round = "grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-accent hover:border-brand";

/** The website's top bar on large screens. Phones use the floating tab bar (AppNav). */
export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header data-site="header" className={`z-40 hidden h-[4.5rem] border-b border-line bg-surface lg:block ${isReaderPath(pathname) ? "relative" : "sticky top-0"}`}>
      <div className="mx-auto flex h-full max-w-[80rem] items-center gap-4 px-6 xl:gap-8 xl:px-8">
        <Link href="/" className="shrink-0 font-display text-[1.375rem] font-bold text-accent">নূর কুরআন</Link>
        <nav aria-label="ওয়েবসাইট মেনু" className="min-w-0 flex-1">
          <ul className="flex items-center xl:gap-1">
            {LINKS.map(({ href, label }) => {
              const active = isActivePath(href, pathname);
              return (
                <li key={href}>
                  <Link href={href} aria-current={active ? "page" : undefined} className={`flex h-11 items-center whitespace-nowrap rounded-full px-2 text-[0.9375rem] xl:px-3.5 xl:text-base ${active ? "bg-active font-semibold text-accent" : "text-muted hover:text-text"}`}>{label}</Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Link href="/search/" aria-label="সার্চ" className={round}><Search aria-hidden className="size-5" /></Link>
        <Link href="/more/" aria-label="সব ফিচার" className={round}><LayoutGrid aria-hidden className="size-5" /></Link>
        <Link href="/settings/" aria-label="সেটিংস" className={`${round} max-xl:hidden`}><Settings aria-hidden className="size-5" /></Link>
      </div>
    </header>
  );
}
