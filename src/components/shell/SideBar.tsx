"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { isActivePath } from "@/lib/nav";
import { SIDE_LINKS } from "@/lib/shell";

/** Icons only from tablet width; with names from desktop width. */
export function SideBar() {
  const pathname = usePathname();
  const foot = "flex min-h-11 items-center justify-center rounded-xl text-ink2 hover:text-ac lg:justify-start lg:px-2 lg:text-[0.8125rem]";
  return (
    <aside data-site="sidebar" className="sticky top-0 hidden h-dvh w-[4.75rem] shrink-0 flex-col gap-1 overflow-y-auto border-r border-ln bg-rail px-2.5 pb-3 pt-[calc(1rem+var(--safe-top))] md:flex lg:w-[15.5rem] lg:px-3">
      <Link href="/" aria-label="নূর কুরআন, হোম" className="mb-3 flex min-h-11 shrink-0 items-center justify-center gap-2.5 lg:justify-start lg:px-2">
        <span className="grid size-9 place-items-center rounded-xl bg-hero text-hero-accent"><Icon name="quran" className="size-[1.375rem]" /></span>
        <span className="hidden font-display text-xl font-bold lg:inline">নূর কুরআন</span>
      </Link>
      <nav aria-label="ওয়েবসাইট মেনু">
        <ul className="space-y-1">
          {SIDE_LINKS.map(({ href, label, icon }) => {
            const active = isActivePath(href, pathname);
            return (
              <li key={href}>
                <Link href={href} aria-label={label} title={label} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center justify-center gap-3 rounded-xl text-[0.9375rem] lg:justify-start lg:px-3 ${active ? "bg-ac/10 font-semibold text-ink" : "text-ink2 hover:bg-ln"}`}>
                  <Icon name={icon} className={`size-[1.375rem] ${active ? "text-ac" : ""}`} />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <ul className="mt-auto flex flex-col pt-2 lg:flex-row lg:gap-1">
        <li><Link href="/about/" aria-label="উৎস ও শর্ত" title="উৎস ও শর্ত" className={foot}><Icon name="info" className="size-5 lg:hidden" /><span className="hidden lg:inline">উৎস ও শর্ত</span></Link></li>
        <li><Link href="/offline/" aria-label="অ্যাপ ইনস্টল" title="অ্যাপ ইনস্টল" className={foot}><Icon name="download" className="size-5 lg:hidden" /><span className="hidden lg:inline">অ্যাপ ইনস্টল</span></Link></li>
      </ul>
    </aside>
  );
}
