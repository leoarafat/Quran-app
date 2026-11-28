"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { isActivePath, isReaderPath } from "@/lib/nav";
import { TABS } from "@/lib/shell";

/** Bottom bar on phones (hidden while reading). Wider screens use the side bar. */
export function TabBar() {
  const pathname = usePathname();
  if (isReaderPath(pathname)) return null;
  return (
    <nav aria-label="প্রধান মেনু" className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-ln bg-sf pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_22px_-18px_rgba(16,40,30,0.4)] md:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5 px-1 py-1.5">
        {TABS.map(({ href, label, icon }) => {
          const active = isActivePath(href, pathname) || (href === "/more/" && !TABS.some((t) => isActivePath(t.href, pathname)));
          return (
            <li key={href}>
              <Link href={href} transitionTypes={["tab"]} aria-current={active ? "page" : undefined} className={`flex min-h-13 flex-col items-center justify-center gap-0.5 text-[0.6875rem] leading-tight ${active ? "font-semibold text-ac" : "text-ink2"}`}>
                <span className={`grid h-8 w-13 place-items-center rounded-full ${active ? "bg-ac text-on-ac" : ""}`}><Icon name={icon} className="size-[1.375rem]" /></span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
