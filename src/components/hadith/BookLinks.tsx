import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { toBnDigits } from "@/lib/bn";
import type { HadithBook } from "@/lib/hadith/types";

export function BookLinks({ books }: { books: HadithBook[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((b) => (
        <li key={b.slug}>
          <Link href={`/hadith/book/${b.slug}/`} prefetch={false} className="flex h-full min-h-16 items-center gap-3 rounded-md border border-ln bg-sf px-4 py-3 shadow-card">
            <Icon name="hadith" className="size-6 shrink-0 text-ac" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold leading-snug">{b.title}</span>
              <span className="block text-[0.8125rem] text-ink2">{toBnDigits(b.hadiths.length)}টি হাদিস</span>
            </span>
            <Icon name="chev" className="size-5 shrink-0 text-ink2" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
