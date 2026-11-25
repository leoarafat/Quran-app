import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { DailyAyah, type DailyItem } from "@/components/home/DailyAyah";
import { PrayerArch } from "@/components/home/PrayerArch";
import { QuickTiles } from "@/components/home/QuickTiles";
import { FeatureGrid } from "@/components/FeatureGrid";
import { ContinueReading } from "@/components/quran/ContinueReading";
import { TodayDate } from "@/components/TodayDate";
import { Welcome } from "@/components/Welcome";
import { DAILY_REFS } from "@/lib/quran/daily";
import { getIndex, getSurah } from "@/lib/quran/server";

export default function HomePage() {
  const { surahs } = getIndex();
  const daily: DailyItem[] = DAILY_REFS.map(([s, a]) => {
    const { ar, tr, bn } = getSurah(s).ayahs[a - 1];
    return { s, a, surah: surahs[s - 1].bangla, ar, tr, bn };
  });

  return (
    <>
      <Welcome />
      <div className="mx-auto max-w-md space-y-3.5 lg:max-w-none lg:space-y-6">
        <header className="flex items-center justify-between gap-3">
          <h1>
            <span className="block text-sm text-muted lg:text-base">আসসালামু আলাইকুম</span>
            <TodayDate className="font-display text-[1.3125rem] font-semibold lg:text-3xl" />
          </h1>
          <Link href="/search/" aria-label="সার্চ" className="grid size-[2.875rem] shrink-0 place-items-center rounded-full border border-line bg-surface text-accent lg:hidden">
            <Search aria-hidden className="size-[1.3125rem]" strokeWidth={1.8} />
          </Link>
          <Link href="/search/" className="hidden h-12 w-[26rem] items-center gap-3 rounded-full border border-line-strong bg-surface px-5 text-muted hover:border-brand lg:flex">
            <Search aria-hidden className="size-5 text-accent" /> কুরআন ও হাদিসে খুঁজুন
          </Link>
        </header>
        <div className="space-y-3.5 lg:grid lg:grid-cols-[24rem_minmax(0,1fr)] lg:items-start lg:gap-8 lg:space-y-0">
          <div className="space-y-3.5">
            <PrayerArch />
            <ContinueReading names={surahs.map((s) => s.bangla)} />
            <div className="pt-1 lg:hidden"><QuickTiles /></div>
            <Link href="/me/" className="flex min-h-14 items-center justify-between gap-3 rounded-[1.375rem] border border-line bg-surface px-4 py-2 hover:border-brand">
              <span><span className="block font-display font-semibold">আমার পাতা</span><span className="block text-sm text-muted">আজকের আমল, খতম ও অগ্রগতি</span></span>
              <ChevronRight aria-hidden className="size-5 shrink-0 text-accent" />
            </Link>
          </div>
          <div className="min-w-0 space-y-6">
            <DailyAyah items={daily} />
            <div className="hidden lg:block"><FeatureGrid compact /></div>
          </div>
        </div>
      </div>
    </>
  );
}
