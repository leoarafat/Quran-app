import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Search } from "lucide-react";
import { CategoryLinks } from "@/components/hadith/CategoryLinks";
import { DailyHadith } from "@/components/hadith/DailyHadith";
import { SourceNote } from "@/components/hadith/SourceNote";
import { PageHeader } from "@/components/PageHeader";
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

  const link = "flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full border border-line-strong bg-surface px-3 font-semibold text-accent";
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title="হাদিস" subtitle={`${toBnDigits(index.meta.total)}টি সহিহ ও হাসান হাদিস, ব্যাখ্যাসহ`} />
      <div className="flex gap-2">
        <Link href="/search/?scope=hadith" className={link}><Search aria-hidden className="size-5" /> হাদিস খুঁজুন</Link>
        <Link href="/amal/" className={link}><Heart aria-hidden className="size-5" /> দোয়া ও যিকির</Link>
      </div>
      <DailyHadith items={daily} />
      <h2 className="pt-2 font-display text-lg font-semibold">বিষয় অনুযায়ী</h2>
      <CategoryLinks categories={roots} />
      <SourceNote meta={index.meta} />
    </div>
  );
}
