import Link from "next/link";
import { DailyAyah, type DailyItem } from "@/components/home/DailyAyah";
import { ExploreSmall, ExploreWide, Quick } from "@/components/home/Explore";
import { Greeting } from "@/components/home/Greeting";
import { MySnapshot, TodayDeeds } from "@/components/home/MySnapshot";
import { PrayerHero } from "@/components/home/PrayerHero";
import { Upcoming } from "@/components/home/Upcoming";
import { ContinueReading } from "@/components/quran/ContinueReading";
import { Icon } from "@/components/ui/Icon";
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
  const icon = "grid size-11 place-items-center rounded-xl";

  return (
    <>
      <Welcome />
      <div className="mx-auto max-w-md space-y-7 md:max-w-none">
        <div className="-mt-3 !mb-2 flex items-center justify-between md:hidden">
          <p className="font-display text-[1.375rem] font-bold">নূর কুরআন</p>
          <div className="-mr-2.5 flex gap-1">
            <Link href="/search/" aria-label="খুঁজুন" className={icon}><Icon name="search" /></Link>
            <Link href="/settings/" aria-label="সেটিংস" className={icon}><Icon name="settings" /></Link>
          </div>
        </div>

        {/* One order in the page; wide screens move the right column up beside the rest. */}
        <div className="grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_21.25rem] xl:items-start">
          <div className="min-w-0 space-y-7 xl:space-y-5">
            <Greeting basmalah={getSurah(1).ayahs[0].ar} />
            <div className="-mt-4 xl:mt-0"><PrayerHero /></div>
            <Link href="/search/" className="-mt-3 flex h-13 items-center gap-3 rounded-md border border-ln2 bg-sf px-4 text-ink2 md:hidden">
              <Icon name="search" /> কুরআন ও হাদিসে খুঁজুন
            </Link>
            <div className="-mt-1 grid grid-cols-1 gap-7 md:grid-cols-[1.3fr_1fr] md:items-stretch md:gap-5 xl:mt-0">
              <ContinueReading surahs={surahs.map((s) => ({ name: s.bangla, arabic: s.arabic, ayahs: s.ayahs }))} />
              <div className="order-2 min-w-0 md:order-none"><MySnapshot /></div>
              <div className="order-1 min-w-0 md:hidden"><Quick /></div>
            </div>
            <ExploreSmall />
            <ExploreWide />
          </div>
          <div className="space-y-5">
            <DailyAyah items={daily} credit={credit} />
            <div className="hidden xl:block"><TodayDeeds /></div>
            <Upcoming />
          </div>
        </div>

        <footer className="border-t border-ln pt-4 md:hidden">
          <p className="font-display text-[1.0625rem] font-bold">নূর কুরআন</p>
          <p className="text-[0.8125rem] text-ink2">কুরআন, হাদিস ও দৈনিক ইবাদতের বাংলা সঙ্গী।</p>
          <p className="flex gap-4 text-sm font-medium text-ac">
            <Link href="/about/" className="inline-flex min-h-11 items-center">উৎস ও শর্ত</Link>
            <Link href="/offline/" className="inline-flex min-h-11 items-center">অ্যাপ ইনস্টল</Link>
          </p>
        </footer>
      </div>
    </>
  );
}
