import Link from "next/link";
import { Search } from "lucide-react";
import { DailyAyah, type DailyItem } from "@/components/home/DailyAyah";
import { PrayerArch } from "@/components/home/PrayerArch";
import { QuickTiles } from "@/components/home/QuickTiles";
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
      <div className="mx-auto max-w-md space-y-3.5">
        <header className="flex items-center justify-between gap-3">
          <h1>
            <span className="block text-sm text-muted">আসসালামু আলাইকুম</span>
            <TodayDate className="font-display text-[1.3125rem] font-semibold" />
          </h1>
          <Link href="/search/" aria-label="সার্চ" className="grid size-[2.875rem] shrink-0 place-items-center rounded-full border border-line bg-surface text-accent">
            <Search aria-hidden className="size-[1.3125rem]" strokeWidth={1.8} />
          </Link>
        </header>
        <PrayerArch />
        <ContinueReading names={surahs.map((s) => s.bangla)} />
        <div className="pt-1"><QuickTiles /></div>
        <DailyAyah items={daily} />
      </div>
    </>
  );
}
