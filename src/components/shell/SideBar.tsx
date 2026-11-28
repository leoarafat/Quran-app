"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upcoming } from "@/components/home/Upcoming";
import { Logo } from "@/components/ui/Logo";
import { isActivePath, isReaderPath } from "@/lib/nav";
import { MAIN_LINKS, MY_LINKS } from "@/lib/shell";

/** The white side bar of wide screens. On a tablet it steps aside while a surah is being read. */
export function SideBar() {
  const pathname = usePathname();
  // Only the closest menu entry is marked, so /amal/surah/ does not also light up /amal/.
  const found = [...MAIN_LINKS, ...MY_LINKS].filter((l) => isActivePath(l.href, pathname)).sort((a, b) => b.href.length - a.href.length)[0]?.href;
  // the top bar marks these itself
  const here = found ?? (/^\/(settings|offline|search)\/?$/.test(pathname) ? undefined : "/more/");
  const list = (links: typeof MAIN_LINKS) => (
    <ul className="space-y-1">
      {links.map(({ href, label }) => (
        <li key={href}>
          <Link href={href} transitionTypes={["tab"]} aria-current={href === here ? "page" : undefined} className={`flex min-h-11 items-center rounded-xl px-3.5 text-[0.9375rem] ${href === here ? "bg-ac font-semibold text-on-ac shadow-card" : "text-ink hover:bg-tint"}`}>{label}</Link>
        </li>
      ))}
    </ul>
  );
  return (
    <aside data-site="sidebar" className={`sticky top-0 hidden h-dvh w-52 shrink-0 flex-col gap-5 overflow-y-auto border-r border-ln bg-rail px-3 pb-4 pt-[calc(1.5rem+var(--safe-top))] lg:flex lg:w-[15.5rem] lg:px-4 ${isReaderPath(pathname) ? "" : "md:flex"}`}>
      <Link href="/" aria-label="নূর কুরআন, হোম" className="flex shrink-0 items-center gap-3 px-2">
        <Logo />
        <span className="leading-tight">
          <span className="block font-display text-[1.375rem] font-bold">নূর কুরআন</span>
          <span className="block text-xs text-ink2">বাংলা ইবাদতের সঙ্গী</span>
        </span>
      </Link>
      <nav aria-label="ওয়েবসাইট মেনু">{list(MAIN_LINKS)}</nav>
      <nav aria-label="ব্যক্তিগত মেনু" className="border-t border-ln pt-4">
        <p className="px-3.5 pb-1 text-xs text-ink2">ব্যক্তিগত</p>
        {list(MY_LINKS)}
      </nav>
      <Upcoming />
    </aside>
  );
}
