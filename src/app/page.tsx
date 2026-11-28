import Link from "next/link";
import { DailyAyah, type DailyItem } from "@/components/home/DailyAyah";
import { FeatureTiles, QuickSurahs } from "@/components/home/Explore";
import { HomeSurahs } from "@/components/home/HomeSurahs";
import { PrayerHero } from "@/components/home/PrayerHero";
import { KhatmCard, TodayAmal } from "@/components/home/TodayAmal";
import { Upcoming } from "@/components/home/Upcoming";
import { ContinueReading } from "@/components/quran/ContinueReading";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { Onboarding } from "@/components/Onboarding";
import { Welcome } from "@/components/Welcome";
import { DAILY_REFS } from "@/lib/quran/daily";
import { getIndex, getSurah } from "@/lib/quran/server";

export default function HomePage() {
  const { surahs, sources } = getIndex();
  const daily: DailyItem[] = DAILY_REFS.map(([s, a]) => {
    const { ar, tr, bn } = getSurah(s).ayahs[a - 1];
    return { s, a, surah: surahs[s - 1].bangla, ar, tr, bn };
  });
  const credit = `অনুবাদ: রুওয়্যাদ অনুবাদ কেন্দ্র (QuranEnc.com v${sources.translation.version}) · আরবি: Tanzil.net`;
  const square = "bar-square grid size-11 place-items-center rounded-[0.875rem]";

  return (
    <>
      <Welcome />
      <Onboarding sample={{ ar: getSurah(1).ayahs[1].ar, bn: getSurah(1).ayahs[1].bn }} />
      <div className="flex flex-col gap-5">
        <div className="app-bar flex min-h-17 items-center justify-between gap-3 md:hidden">
          <h1 className="flex items-center gap-2.5 font-display text-[1.3125rem] font-bold"><Logo light className="size-10" />নূর কুরআন</h1>
          <div className="flex gap-2">
            <Link href="/search/" aria-label="খুঁজুন" className={square}><Icon name="search" className="size-5" /></Link>
            <Link href="/settings/" aria-label="সেটিংস" className={square}><Icon name="settings" className="size-5" /></Link>
          </div>
        </div>

        {/* One column on phones, in the order given by `order-*`; two columns from desktop width. */}
        <div className="flex flex-col gap-6 max-md:-mt-5 xl:grid xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
          <div className="contents xl:flex xl:min-w-0 xl:flex-col xl:gap-6">
            <div className="home-hero"><PrayerHero /></div>
            <div className="order-2 xl:order-none"><FeatureTiles /></div>
            <div className="order-1 grid gap-4 md:grid-cols-[2fr_1fr] md:items-stretch xl:order-none">
              <ContinueReading surahs={surahs.map((s) => ({ name: s.bangla, arabic: s.arabic, ayahs: s.ayahs }))} />
              <div className="hidden md:block"><KhatmCard /></div>
            </div>
            <div className="order-5 xl:order-none"><QuickSurahs surahs={surahs} /></div>
            <div className="order-6 xl:order-none"><HomeSurahs surahs={surahs.map(({ n, bangla, arabic, ayahs, revelation }) => ({ n, bangla, arabic, ayahs, revelation }))} /></div>
          </div>
          <div className="contents xl:flex xl:min-w-0 xl:flex-col xl:gap-5">
            <div className="order-3 xl:order-none"><DailyAyah items={daily} credit={credit} /></div>
            <div className="order-4 xl:order-none"><TodayAmal /></div>
            <div className="order-7 md:hidden"><Upcoming tone="deep" /></div>
          </div>
        </div>
      </div>
    </>
  );
}
