import type { Metadata } from "next";
import Link from "next/link";
import { ArabicLessons, type ShownExample } from "@/components/arabic/ArabicLessons";
import { LearnedMark } from "@/components/Learned";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { NewBadge } from "@/components/NewBadge";
import { PendingNote } from "@/components/PendingNote";
import { findExamples } from "@/lib/arabic/letters";
import { QAIDA, qaidaPath } from "@/lib/arabic/qaida";
import { exampleAyahs } from "@/lib/arabic/server";
import { toBnDigits } from "@/lib/bn";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "আরবি শিখুন" };

export default function ArabicPage() {
  const { surahs } = getIndex();
  const examples: Record<string, ShownExample[]> = Object.fromEntries(
    Object.entries(findExamples(exampleAyahs())).map(([letter, list]) => [letter, list.map((e) => ({ ...e, surahName: surahs[e.s - 1].bangla }))]),
  );

  return (
    <div className="mx-auto max-w-2xl lg:max-w-5xl space-y-4">
      <ScreenHeader title="আরবি শিখুন" back={{ href: "/more/", label: "আরও পাতায় ফিরে যান" }} />
      <p className="text-[0.9375rem] text-ink2">হরফ, হরকত ও চেনার অনুশীলন</p>
      <ArabicLessons examples={examples} />
      <section aria-labelledby="qaida" className="space-y-2">
        <h2 id="qaida" className="font-display text-lg font-semibold">ধাপে ধাপে কুরআন পড়া শিখুন</h2>
        <p className="text-sm leading-relaxed text-ink2">আগে ওপরের হরফ ও হরকত চিনুন, তারপর পাঠগুলো ক্রমানুসারে পড়ুন। একটি পাঠ ভালোভাবে আয়ত্ত করে পরেরটিতে যান।</p>
        <ol className="grid gap-2 lg:grid-cols-2">
          {QAIDA.map((lesson, i) => (
            <li key={lesson.slug}>
              <Link href={qaidaPath(lesson.slug)} className="flex min-h-16 items-center gap-3 rounded-md border border-ln2 bg-sf px-4 py-2 hover:border-ac">
                <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full border border-ln2 font-semibold text-gt">{toBnDigits(i + 1)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display font-semibold leading-snug">{lesson.title}{lesson.isNew && <NewBadge />}</span>
                  <span className="block text-sm text-ink2">{lesson.hint}</span>
                </span>
                <LearnedMark href={qaidaPath(lesson.slug)} />
              </Link>
            </li>
          ))}
        </ol>
      </section>
      <Link href="/arabic/practice/" className="flex min-h-16 items-center gap-3 rounded-md border border-ln2 bg-sf px-4 py-2 hover:border-ac">
        <span className="min-w-0 flex-1">
          <span className="block font-display font-semibold leading-snug">মিশিয়ে পড়ার অনুশীলন<NewBadge /></span>
          <span className="block text-sm text-ink2">কুরআনের শব্দে তিন ধাপ</span>
        </span>
      </Link>
      <PendingNote title="যা এখনো নেই" items={["আলাদা হরফ ও অনুশীলনের অডিও নেই। উচ্চারণ কোনো শিক্ষকের কাছে শুনে শিখুন।", "হরফের বাংলা নাম, মাখরাজ ও তাজবিদের বর্ণনা: ক্বারীর যাচাই বাকি।"]} />
    </div>
  );
}
