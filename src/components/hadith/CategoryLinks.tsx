import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { toBnDigits } from "@/lib/bn";
import type { HadithCategory } from "@/lib/hadith/types";

export function CategoryLinks({ categories }: { categories: HadithCategory[] }) {
  return (
    <ul className="space-y-2">
      {categories.map((c) => (
        <li key={c.id}>
          <Link href={`/hadith/c/${c.id}/`} prefetch={false} className="flex min-h-16 items-center gap-3 rounded-[1.375rem] border border-line bg-surface px-4 py-2 hover:border-brand">
            <span className="min-w-0 flex-1 font-display font-semibold leading-snug">{c.title}</span>
            <span className="shrink-0 text-sm text-muted">{toBnDigits(c.count)}টি</span>
            <ChevronRight aria-hidden className="size-5 shrink-0 text-accent" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
