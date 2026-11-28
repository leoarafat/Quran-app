"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DateLine } from "@/components/home/Greeting";
import { Icon } from "@/components/ui/Icon";
import { sectionTitle } from "@/lib/shell";

// Loaded on first use, so the search code is not part of every page.
const CommandPalette = dynamic(() => import("@/components/search/CommandPalette"), { ssr: false });

/** From tablet width up: the page's name (the greeting at home), search, install and settings. Ctrl K or Cmd K opens search. */
export function TopBar({ surahNames }: { surahNames: string[] }) {
  const pathname = usePathname();
  const [palette, setPalette] = useState(false);
  const home = pathname === "/";
  /** that page opens with its own banner */
  const bare = pathname.replace(/\/$/, "") === "/namaz";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // Another dialog may be open; the palette does not pile on top of it.
        if (!document.querySelector("dialog[open]")) setPalette(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const at = pathname.replace(/\/$/, "");
  const square = (href: string) => `grid h-12 shrink-0 place-items-center rounded-[0.875rem] border ${at === href ? "border-ac bg-ac text-on-ac shadow-card" : "border-ln2 bg-sf hover:border-ac"}`;
  const mark = (href: string) => (at === href ? ("page" as const) : undefined);
  return (
    <header data-site="header" className={`mx-auto hidden w-full max-w-[75rem] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 pt-[calc(1.5rem+var(--safe-top))] lg:px-8 ${bare ? "" : "md:flex"}`}>
      <div className="min-w-0">
        {home ? <h1 className="font-display text-[1.875rem] font-bold leading-snug">আসসালামু আলাইকুম</h1> : <p className="truncate font-display text-[1.625rem] font-bold leading-snug">{sectionTitle(pathname, surahNames)}</p>}
        {home && <p className="min-h-[1.65em] text-[0.9375rem] text-ink2"><DateLine /></p>}
      </div>
      <div className="flex items-center gap-3">
        {/* A plain click opens the palette; a new tab still gets the search page. */}
        <Link href="/search/" onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); setPalette(true); }} aria-haspopup="dialog" className="hidden h-12 w-[22.5rem] items-center gap-2.5 rounded-[0.875rem] border border-ln2 bg-sf px-3.5 text-[0.9375rem] text-ink2 hover:border-ac xl:flex">
          <Icon name="search" className="size-5" />
          <span className="flex-1">কুরআন ও হাদিসে খুঁজুন</span>
          <kbd aria-hidden="true" className="rounded-md border border-ln2 px-1.5 font-sans text-xs">Ctrl K</kbd>
        </Link>
        <Link href="/search/" aria-label="খুঁজুন" aria-current={mark("/search")} className={`${square("/search")} w-12 xl:hidden`}><Icon name="search" className="size-5" /></Link>
        <Link href="/offline/" aria-current={mark("/offline")} className={`${square("/offline")} px-4 text-sm font-semibold`}>অ্যাপ ইনস্টল</Link>
        <Link href="/settings/" aria-label="সেটিংস" aria-current={mark("/settings")} className={`${square("/settings")} w-12`}><Icon name="settings" className="size-5" /></Link>
      </div>
      {palette && <CommandPalette onClose={() => setPalette(false)} />}
    </header>
  );
}
