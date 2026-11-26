import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { toBnDigits } from "@/lib/bn";
import type { HadithCategory } from "@/lib/hadith/types";

export function CategoryLinks({ categories }: { categories: HadithCategory[] }) {
  return (
    <ul className="rounded-md border border-ln bg-sf px-4 py-1 shadow-card lg:grid lg:grid-cols-2 lg:gap-x-6">
      {categories.map((c) => (
        <li key={c.id} className="border-b border-ln last:border-0">
          <Link href={`/hadith/c/${c.id}/`} prefetch={false} className="flex h-full min-h-14 items-center gap-3 py-2">
            <span className="min-w-0 flex-1 font-semibold leading-snug">{c.title}</span>
            <span className="shrink-0 text-[0.8125rem] text-ink2">{toBnDigits(c.count)}টি</span>
            <Icon name="chev" className="size-5 shrink-0 text-ink2" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
