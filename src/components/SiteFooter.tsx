"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FEATURE_GROUPS } from "@/lib/features";
import { isReaderPath } from "@/lib/nav";

/** Large screens only. Lists the same pages as the "আরও" screen. */
export function SiteFooter() {
  const pathname = usePathname();
  if (isReaderPath(pathname)) return null;
  return (
    <footer data-site="footer" className="hidden border-t border-line bg-surface lg:block">
      <div className="mx-auto grid max-w-[80rem] grid-cols-[1.4fr_1fr_1fr_1.6fr] gap-8 px-8 py-10">
        <div>
          <p className="font-display text-xl font-bold text-accent">নূর কুরআন</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">বাংলা কুরআন, উচ্চারণ, তিলাওয়াত, হাদিস, দোয়া ও নামাজ শিক্ষা।</p>
          <ul className="mt-3 flex gap-4 text-sm">
            <li><Link href="/about/" className="inline-flex min-h-11 items-center text-accent underline">উৎস ও শর্ত</Link></li>
            <li><Link href="/offline/" className="inline-flex min-h-11 items-center text-accent underline">অ্যাপ ইনস্টল</Link></li>
          </ul>
        </div>
        {FEATURE_GROUPS.map((group, i) => (
          <nav key={group.title} aria-label={`ফুটার: ${group.title}`}>
            <h2 className="mb-2 font-display font-semibold">{group.title}</h2>
            <ul className={i === 2 ? "grid grid-cols-2 gap-x-4" : ""}>
              {group.items.map((f) => f.href && (
                <li key={f.title}><Link href={f.href} prefetch={false} className="inline-flex min-h-8 items-center text-sm text-muted hover:text-accent">{f.title}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}
