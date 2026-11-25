import type { Metadata } from "next";
import { ArabicLessons, type ShownExample } from "@/components/arabic/ArabicLessons";
import { PageHeader } from "@/components/PageHeader";
import { PendingNote } from "@/components/PendingNote";
import { findExamples } from "@/lib/arabic/letters";
import { getIndex, getSurah } from "@/lib/quran/server";

export const metadata: Metadata = { title: "আরবি শিখুন" };

export default function ArabicPage() {
  const { surahs } = getIndex();
  // Al-Fatiha first, then from the last surah backwards: the short surahs most people know.
  function* ayahs() {
    for (const n of [1, ...Array.from({ length: 113 }, (_, i) => 114 - i)]) {
      for (const x of getSurah(n).ayahs) yield { s: n, a: x.a, ar: x.ar };
    }
  }
  const examples: Record<string, ShownExample[]> = Object.fromEntries(
    Object.entries(findExamples(ayahs())).map(([letter, list]) => [letter, list.map((e) => ({ ...e, surahName: surahs[e.s - 1].bangla }))]),
  );

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title="আরবি শিখুন" subtitle="হরফ, হরকত ও চেনার অনুশীলন" />
      <ArabicLessons examples={examples} />
      <PendingNote title="যা এখনো নেই" items={["হরফের উচ্চারণ শোনা, মাখরাজ ও তাজবিদ: ক্বারী ছাড়া শেখানো ঠিক হবে না। উচ্চারণ কোনো শিক্ষকের কাছে শুনে শিখুন।", "হরফের বাংলা নাম প্রচলিত বানানে লেখা; ক্বারীর যাচাই বাকি।"]} />
    </div>
  );
}
