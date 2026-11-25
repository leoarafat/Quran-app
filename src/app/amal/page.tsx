import type { Metadata } from "next";
import Link from "next/link";
import { CloudSun, DoorOpen, Heart, House, Moon, Repeat, ScrollText, Shield, Sunrise, Zap } from "lucide-react";
import { SourceNote } from "@/components/hadith/SourceNote";
import { PageHeader } from "@/components/PageHeader";
import { toBnDigits } from "@/lib/bn";
import { getHadithIndex } from "@/lib/hadith/server";

export const metadata: Metadata = { title: "দোয়া ও যিকির" };

/** Topics exactly as the publisher groups them; only the icons are ours. */
const TOPICS = [
  [301, Sunrise], [293, Moon], [465, ScrollText], [303, House], [306, DoorOpen], [307, Shield], [308, Zap], [313, Heart], [302, Repeat],
] as const;

export default function AmalPage() {
  const { index, categories } = getHadithIndex();
  const topics = TOPICS.flatMap(([id, icon]) => (categories.has(id) ? [{ ...categories.get(id)!, icon }] : []));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title="দোয়া ও যিকির" subtitle="হাদিস থেকে, রেফারেন্স ও ব্যাখ্যাসহ" />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
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
        <p className="text-sm leading-relaxed text-muted">এই ভাগগুলো উৎস প্রকাশকের; এতে দোয়ার পাশাপাশি আদব ও বিধানের হাদিসও আছে। ঘুম থেকে ওঠা থেকে রাত পর্যন্ত ধাপে ধাপে আমলের রুটিন, গণনা ও দোয়ার বাংলা উচ্চারণ আলেমের যাচাইয়ের পর যোগ হবে।</p>
      </div>
      <SourceNote meta={index.meta} />
    </div>
  );
}
