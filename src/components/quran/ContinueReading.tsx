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
  return (
    <section aria-label={place ? "শেষ পড়া" : "পড়া শুরু"} className="flex flex-col gap-3.5 rounded-md border border-ln bg-sf p-4.5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.8125rem] text-ink2">{place ? "শেষ পড়া" : "কুরআন পড়া শুরু করুন"}</p>
          <p className="font-display text-[1.375rem] font-semibold leading-normal">সূরা {surah.name}{place && ` · আয়াত ${toBnDigits(ayah)}`}</p>
          <p className="text-[0.8125rem] text-ink2">{place ? `${toBnDigits(surah.ayahs)} আয়াতের মধ্যে ${toBnDigits(ayah)} · ${toBnDigits(Math.round(share * 100))}%` : `${toBnDigits(surah.ayahs)} আয়াত`}</p>
        </div>
        <span lang="ar" dir="rtl" className="shrink-0 font-arabic text-[1.875rem] leading-[1.8]">{surah.arabic}</span>
      </div>
      <ProgressBar value={share} />
      <Link href={place ? `/quran/${place.s}/#a${ayah}` : "/quran/1/"} className="mt-auto flex h-13 items-center justify-center rounded-full bg-ac text-[1.0625rem] font-semibold text-on-ac md:h-12 md:w-fit md:px-6">
        {place ? "চালিয়ে যান" : "পড়া শুরু করুন"}
      </Link>
    </section>
  );
}
