"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { sectionTitle } from "@/lib/shell";

// Loaded on first use, so the search code is not part of every page.
const CommandPalette = dynamic(() => import("@/components/search/CommandPalette"), { ssr: false });

/** The title bar from tablet width up. Ctrl K or Cmd K opens the search palette from anywhere. */
export function TopBar({ surahNames }: { surahNames: string[] }) {
  const pathname = usePathname();
  const [palette, setPalette] = useState(false);

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

  const round = "grid size-11 shrink-0 place-items-center rounded-xl hover:bg-ln";
  return (
    <header data-site="header" className="sticky top-0 z-30 hidden h-[calc(var(--header-h)+var(--safe-top))] items-center gap-3 border-b border-ln bg-bg px-6 pt-[var(--safe-top)] md:flex lg:px-8">
      <p className="min-w-0 flex-1 truncate font-display text-[1.375rem] font-semibold">{sectionTitle(pathname, surahNames)}</p>
      {/* A plain click opens the palette; a new tab still gets the search page. */}
      <Link href="/search/" onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); setPalette(true); }} aria-haspopup="dialog" className="hidden h-11 w-[23.75rem] items-center gap-2.5 rounded-[0.875rem] border border-ln2 bg-sf px-3.5 text-[0.9375rem] text-ink2 hover:border-ac lg:flex">
        <Icon name="search" className="size-5" />
        <span className="flex-1">কুরআন ও হাদিসে খুঁজুন</span>
        <kbd aria-hidden="true" className="rounded-md border border-ln2 px-1.5 font-sans text-xs">Ctrl K</kbd>
      </Link>
      <Link href="/search/" aria-label="খুঁজুন" className={`${round} lg:hidden`}><Icon name="search" /></Link>
      <Link href="/settings/" aria-label="সেটিংস" className={round}><Icon name="settings" /></Link>
      {palette && <CommandPalette onClose={() => setPalette(false)} />}
    </header>
  );
}
