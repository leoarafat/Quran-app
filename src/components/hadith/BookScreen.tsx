import Link from "next/link";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { toBnDigits } from "@/lib/bn";
import { bookTopics, getHadithIndex } from "@/lib/hadith/server";
import { HadithList } from "./HadithList";
import { SourceNote } from "./SourceNote";

/** One book, either all of it or one top-level topic of it. */
export function BookScreen({ slug, topic }: { slug: string; topic?: number }) {
  const { index } = getHadithIndex();
  const { book, topics } = bookTopics(slug)!;
  const current = topics.find((t) => t.id === topic);
  const ids = current ? current.hadiths : book.hadiths;
  const items = ids.map((id) => {
    const numbers = slug === "bukhari" ? index.bukhariNumbers[id] : undefined;
    return { id, title: index.titles[id][0], grade: index.titles[id][1], note: numbers && `বুখারী ${toBnDigits(numbers.join(", "))} (যন্ত্রে মিলানো নম্বর)` };
  });
  const pill = (active: boolean) => `inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold ${active ? "border-ac bg-ac text-on-ac" : "border-ln2 bg-sf"}`;

  return (
    <div className="mx-auto max-w-2xl space-y-4 lg:max-w-5xl">
      <ScreenHeader title={book.title} back={{ href: "/hadith/", label: "হাদিসে ফিরে যান" }} />
      <p className="font-display text-xl font-semibold max-md:hidden">{book.title}</p>
      <p className="text-sm leading-relaxed text-ink2">এটি পূর্ণ গ্রন্থ নয়। এই সংকলনের {toBnDigits(book.hadiths.length)}টি হাদিসের রেফারেন্সে {book.title}-এর নাম আছে।</p>
      <nav aria-label="বিষয় অনুযায়ী ভাগ" className="flex flex-wrap gap-2">
        <Link href={`/hadith/book/${slug}/`} aria-current={current ? undefined : "page"} className={pill(!current)}>সব বিষয়</Link>
        {topics.map((t) => <Link key={t.id} href={`/hadith/book/${slug}/${t.id}/`} prefetch={false} aria-current={t.id === topic ? "page" : undefined} className={pill(t.id === topic)}>{t.title} ({toBnDigits(t.hadiths.length)})</Link>)}
      </nav>
      <HadithList key={`${slug}-${topic ?? "all"}`} items={items} />
      <SourceNote meta={index.meta} />
    </div>
  );
}
