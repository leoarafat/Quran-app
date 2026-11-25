"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { isActivePath, isReaderPath } from "@/lib/nav";
import { TABS } from "@/lib/shell";

/** Floating tab bar on phones (hidden while reading). Wider screens use the side bar. */
export function TabBar() {
  const pathname = usePathname();
  if (isReaderPath(pathname)) return null;
  return (
    <nav aria-label="প্রধান মেনু" className="fixed inset-x-3 bottom-[calc(0.875rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md rounded-[1.625rem] border border-ln bg-sf/90 shadow-float backdrop-blur-md md:hidden">
      <ul className="grid grid-cols-5 px-1 py-1.5">
        {TABS.map(({ href, label, icon }) => {
          const active = isActivePath(href, pathname);
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined} className={`flex min-h-13 flex-col items-center justify-center gap-0.5 text-[0.6875rem] leading-tight ${active ? "font-semibold text-ink" : "text-ink2"}`}>
                <Icon name={icon} className={`size-6 ${active ? "text-ac" : ""}`} />
                {label}
                <span aria-hidden="true" className={`size-[5px] rounded-full ${active ? "bg-gd" : ""}`} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
