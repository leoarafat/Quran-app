import type { Metadata } from "next";
import Link from "next/link";
import { CategoryLinks } from "@/components/hadith/CategoryLinks";
import { DailyHadith } from "@/components/hadith/DailyHadith";
import { BookLinks } from "@/components/hadith/BookLinks";
import { NewBadge } from "@/components/NewBadge";
import { toBnDigits as bn } from "@/lib/bn";
import { getFullIndex } from "@/lib/hadith/books";
import { SourceNote } from "@/components/hadith/SourceNote";
import { headerButton, ScreenHeader } from "@/components/shell/ScreenHeader";
import { Icon } from "@/components/ui/Icon";
import { toBnDigits } from "@/lib/bn";
import { getHadith, getHadithIndex } from "@/lib/hadith/server";

export const metadata: Metadata = { title: "হাদিস", description: "সহিহ ও হাসান হাদিস: আরবি, বাংলা অনুবাদ, ব্যাখ্যা ও রেফারেন্স" };

/** The publisher's "virtues and manners" topic. */
const VIRTUES = 5;

export default function HadithPage() {
  const { index, categories } = getHadithIndex();
  const roots = index.categories.filter((c) => !c.parent);

  // Short, sahih ones from that topic rotate as the day's hadith.
  const ids = new Set<number>();
  const walk = (id: number) => { const c = categories.get(id); if (!c) return; c.hadiths.forEach((h) => ids.add(h)); c.children.forEach(walk); };
  walk(VIRTUES);
  const daily = [...ids].sort((a, b) => a - b)
    .filter((id) => index.titles[id][1] === "sahih" && index.titles[id][0].length <= 140)
    .filter((_, i) => i % 3 === 0).slice(0, 60)
    .filter((id) => getHadith(id).hadeeth.length <= 700)
    .map((id) => ({ id, title: index.titles[id][0] }));

  return (
    <div className="mx-auto max-w-2xl lg:max-w-5xl">
      <ScreenHeader title="হাদিস">
        <Link href="/search/?scope=hadith" aria-label="হাদিস খুঁজুন" className={headerButton}><Icon name="search" /></Link>
      </ScreenHeader>
      <div className="space-y-5">
        <Link href="/search/?scope=hadith" className="flex min-h-13 items-center gap-3 rounded-md border border-ln2 bg-sf px-4 text-ink2"><Icon name="search" className="size-5" /> হাদিস খুঁজুন</Link>
        <p className="text-[0.9375rem] text-ink2">{toBnDigits(index.meta.total)}টি সহিহ ও হাসান হাদিস, ব্যাখ্যাসহ</p>
        <DailyHadith items={daily} />
        <Link href="/amal/" className="flex min-h-14 items-center gap-3.5 rounded-md border border-ln bg-sf px-4 py-2 font-semibold shadow-card"><Icon name="deeds" className="size-6 text-ac" /><span className="flex-1">দোয়া ও যিকির</span><Icon name="chev" className="size-5 text-ink2" /></Link>
        <section aria-labelledby="full">
          <h2 id="full" className="mb-2 font-display text-xl font-semibold">পূর্ণ গ্রন্থ (আরবি)<NewBadge /></h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {getFullIndex().books.map((b) => (
              <li key={b.slug}>
                <Link href={`/hadith/full/${b.slug}/`} className="on-deep flex h-full flex-col gap-1 rounded-3xl bg-hero p-5 text-on-hero">
                  <span className="font-display text-xl font-bold">{b.title}</span>
                  <span className="text-hero-accent">{bn(b.total)}টি হাদিস</span>
                  <span className="text-sm text-hero-muted">{bn(b.chapters.filter((c) => c.id > 0).length)}টি অধ্যায় · নম্বর দিয়ে খোঁজা যায়</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="books">
          <h2 id="books" className="mb-2 font-display text-xl font-semibold">বাংলা অনুবাদসহ, গ্রন্থ অনুযায়ী<NewBadge /></h2>
          <BookLinks books={index.books} />
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink2">এগুলো পূর্ণ গ্রন্থ নয়। এই সংকলনের যেসব হাদিসের রেফারেন্সে গ্রন্থটির নাম আছে, শুধু সেগুলো। একটি হাদিস একাধিক গ্রন্থে থাকতে পারে।</p>
        </section>
        <section aria-labelledby="topics">
          <h2 id="topics" className="mb-2 font-display text-xl font-semibold">বিষয় অনুযায়ী</h2>
          <CategoryLinks categories={roots} />
        </section>
        <SourceNote meta={index.meta} />
      </div>
    </div>
  );
}
