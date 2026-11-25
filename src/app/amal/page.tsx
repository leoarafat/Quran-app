import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ChevronRight, CloudSun, DoorOpen, Heart, House, Moon, Repeat, ScrollText, Shield, Sunrise, Zap } from "lucide-react";
import { SourceNote } from "@/components/hadith/SourceNote";
import { PageHeader } from "@/components/PageHeader";
import { toBnDigits } from "@/lib/bn";
import { getHadithIndex } from "@/lib/hadith/server";
import { QURAN_DUAS } from "@/lib/quran/duas";

export const metadata: Metadata = { title: "দোয়া ও যিকির" };

/** Topics exactly as the publisher groups them; only the icons are ours. */
const TOPICS = [
  [301, Sunrise], [293, Moon], [465, ScrollText], [303, House], [306, DoorOpen], [307, Shield], [308, Zap], [313, Heart], [302, Repeat],
] as const;

/** Everyday manners, again under the publisher's own names. The choice awaits a scholar's review. */
const MANNERS = [290, 286, 295, 297, 296, 292, 298, 435, 443, 450, 291, 321, 311] as const;

export default function AmalPage() {
  const { index, categories } = getHadithIndex();
  const topics = TOPICS.flatMap(([id, icon]) => (categories.has(id) ? [{ ...categories.get(id)!, icon }] : []));

  return (
    <div className="mx-auto max-w-2xl lg:max-w-5xl space-y-4">
      <PageHeader title="দোয়া ও যিকির" subtitle="কুরআন ও হাদিস থেকে, রেফারেন্সসহ" />
      <Link href="/amal/quran/" className="flex min-h-20 items-center gap-3.5 rounded-[1.375rem] border border-line-strong bg-surface p-4 hover:border-brand">
        <span className="grid size-14 shrink-0 place-items-center rounded-t-[1.75rem] rounded-b-2xl border border-line-strong text-accent"><BookOpen aria-hidden className="size-6" strokeWidth={1.6} /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-semibold leading-snug">কুরআনের দোয়া</span>
          <span className="block text-sm text-muted">{toBnDigits(QURAN_DUAS.length)}টি দোয়া · আরবি, উচ্চারণ, অর্থ ও তিলাওয়াত</span>
        </span>
        <ChevronRight aria-hidden className="size-5 shrink-0 text-accent" />
      </Link>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 [&>li:last-child:nth-child(odd)]:col-span-2">
        {([["/amal/khatm/", "খতম ও দৈনিক লক্ষ্য", "তিলাওয়াতের হিসাব"], ["/amal/fasting/", "রোজার খাতা", "নিজের রোজার হিসাব"], ["/amal/daily/", "সারাদিনের আমল", "আমার আমলের খাতা"], ["/amal/after-salah/", "নামাজের পরের আমল", "হাদিস ও আয়াত"]] as const).map(([href, title, hint]) => (
          <li key={href}>
            <Link href={href} className="flex h-full min-h-20 flex-col items-center justify-center rounded-[1.375rem] border border-line bg-surface p-3 text-center hover:border-brand">
              <span className="font-display font-semibold leading-snug">{title}</span>
              <span className="text-sm text-muted">{hint}</span>
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="pt-1 font-display text-lg font-semibold">হাদিস থেকে</h2>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {topics.map(({ id, title, count, icon: Icon }) => (
          <li key={id}>
            <Link href={`/hadith/c/${id}/`} prefetch={false} className="flex h-full flex-col items-center gap-2 rounded-[1.375rem] border border-line bg-surface p-4 text-center hover:border-brand">
              <span className="grid size-14 place-items-center rounded-t-[1.75rem] rounded-b-2xl border border-line-strong text-accent"><Icon aria-hidden className="size-6" strokeWidth={1.6} /></span>
              <span className="font-display font-semibold leading-snug">{title}</span>
              <span className="mt-auto text-sm text-muted">{toBnDigits(count)}টি হাদিস</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex gap-3 rounded-[1.375rem] border border-dashed border-line-strong p-4">
        <CloudSun aria-hidden className="mt-1 size-6 shrink-0 text-accent" />
        <p className="text-sm leading-relaxed text-muted">এই ভাগগুলো উৎস প্রকাশকের; এতে দোয়ার পাশাপাশি আদব ও বিধানের হাদিসও আছে। ঘুম থেকে ওঠা থেকে রাত পর্যন্ত সাজানো আমলের রুটিন, গণনা ও দোয়ার বাংলা উচ্চারণ আলেমের যাচাইয়ের পর যোগ হবে।</p>
      </div>
      <h2 className="pt-1 font-display text-lg font-semibold">দৈনন্দিন আদব</h2>
      <ul className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {MANNERS.flatMap((id) => categories.get(id) ?? []).map(({ id, title, count }) => (
          <li key={id}>
            <Link href={`/hadith/c/${id}/`} prefetch={false} className="flex h-full min-h-14 items-center justify-between gap-3 rounded-[1.375rem] border border-line bg-surface px-4 py-2 hover:border-brand">
              <span className="min-w-0 font-display font-semibold leading-snug">{title}</span>
              <span className="shrink-0 text-sm text-muted">{toBnDigits(count)}টি</span>
            </Link>
          </li>
        ))}
      </ul>
      <SourceNote meta={index.meta} />
    </div>
  );
}
