"use client";

import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressRing";
import { toBnDigits } from "@/lib/bn";
import { useLastRead } from "@/lib/quran/lastRead";

export type SurahBrief = { name: string; arabic: string; ayahs: number };

/** Back to where the reader stopped, or the start of the Quran. */
export function ContinueReading({ surahs }: { surahs: SurahBrief[] }) {
  const place = useLastRead();
  const surah = surahs[(place?.s ?? 1) - 1];
  const ayah = place ? Math.min(place.a, surah.ayahs) : 0;
  const share = ayah / surah.ayahs;
  const done = `${toBnDigits(surah.ayahs)} আয়াতের মধ্যে ${toBnDigits(ayah)} · ${toBnDigits(Math.round(share * 100))}%`;
  const href = place ? `/quran/${place.s}/#a${ayah}` : "/quran/1/";
  return (
    <section aria-label={place ? "শেষ পড়া" : "পড়া শুরু"} className="flex h-full flex-col gap-3 rounded-[1.375rem] border border-ln bg-sf p-4.5 md:gap-3.5 md:p-5.5">
      <div className="flex items-center justify-between gap-3 md:items-start">
        <div className="min-w-0">
          <p className="text-xs text-ink2 md:text-[0.8125rem]">{place ? "শেষ পড়া" : "কুরআন পড়া শুরু করুন"}</p>
          <p className="font-display text-[1.1875rem] font-semibold leading-normal md:text-[1.375rem]">সূরা {surah.name}{place && ` · আয়াত ${toBnDigits(ayah)}`}</p>
        </div>
        <span lang="ar" dir="rtl" className="hidden shrink-0 font-arabic text-[1.875rem] leading-[1.8] text-ac md:block">{surah.arabic}</span>
        <Link href={href} className="flex min-h-11.5 shrink-0 items-center rounded-[0.875rem] bg-ac px-4.5 text-sm font-semibold text-on-ac md:hidden">{place ? "চালিয়ে যান" : "শুরু করুন"}</Link>
      </div>
      <ProgressBar value={share} className="md:!h-2" />
      <div className="mt-auto hidden items-center justify-between gap-3 md:flex">
        <span className="text-[0.8125rem] text-ink2">{place ? done : `${toBnDigits(surah.ayahs)} আয়াত`}</span>
        <Link href={href} className="flex min-h-11.5 items-center rounded-xl bg-ac px-6 text-[0.9375rem] font-semibold text-on-ac">{place ? "পড়া চালিয়ে যান" : "পড়া শুরু করুন"}</Link>
      </div>
    </section>
  );
}
