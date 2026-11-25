"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { playAyah } from "@/lib/audio/player";
import { toBnDigits } from "@/lib/bn";
import { loadSurah } from "@/lib/quran/load";
import type { SurahData, SurahInfo } from "@/lib/quran/types";

const WIDE = "(min-width: 80rem)";
const subscribeWide = (listener: () => void) => {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};

/** The chosen surah beside the list, on wide screens only (nothing is downloaded on a phone). */
export function SurahPreview({ surah }: { surah: SurahInfo }) {
  const wide = useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => false);
  const [loaded, setLoaded] = useState<{ n: number; data: SurahData | null } | null>(null);
  useEffect(() => {
    if (!wide) return;
    let alive = true;
    // A short wait, so moving the pointer down the list does not download every surah on the way.
    const timer = setTimeout(() => {
      loadSurah(surah.n).then(
        (data) => { if (alive) setLoaded({ n: surah.n, data }); },
        () => { if (alive) setLoaded({ n: surah.n, data: null }); },
      );
    }, 150);
    return () => { alive = false; clearTimeout(timer); };
  }, [wide, surah.n]);
  if (!wide) return null;
  const current = loaded?.n === surah.n ? loaded : null;
  const first = current?.data?.ayahs[0];

  return (
    <section aria-label={`সূরা ${surah.bangla}: পূর্বরূপ`} className="max-w-xl space-y-3">
      <p className="text-[0.8125rem] text-ink2">পূর্বরূপ</p>
      <p lang="ar" dir="rtl" className="text-right font-arabic text-6xl leading-[1.7]">{surah.arabic}</p>
      <h2 className="font-display text-[2rem] font-semibold leading-snug">{surah.bangla}</h2>
      <p className="text-[0.8125rem] text-ink2">{surah.revelation === "meccan" ? "মাক্কি" : "মাদানি"} · {toBnDigits(surah.ayahs)} আয়াত{first && ` · পারা ${toBnDigits(first.juz)} · পৃষ্ঠা ${toBnDigits(first.page)}`}</p>
      <div className="max-h-[38dvh] min-h-40 overflow-y-auto rounded-md border border-ln bg-sf p-5 shadow-card">
        {first ? (
          <>
            <p lang="ar" dir="rtl" className="font-arabic text-[2rem] leading-[2.2]">{first.ar}</p>
            <p className="reading text-[0.9375rem] text-gt">{first.tr}</p>
            <p className="reading mt-1 text-lg">{first.bn}</p>
          </>
        ) : current ? (
          <p className="text-sm text-ink2">আয়াত আনা যায়নি। সূরাটি খুলে দেখুন।</p>
        ) : (
          <div className="space-y-3"><Skeleton className="h-12" /><Skeleton /><Skeleton className="h-4 w-2/3" /></div>
        )}
      </div>
      <div className="flex gap-3">
        <Link href={`/quran/${surah.n}/`} className="flex h-13 items-center rounded-full bg-ac px-6 font-semibold text-on-ac">পড়া শুরু করুন</Link>
        <button type="button" onClick={() => playAyah({ surah: surah.n, surahName: surah.bangla, total: surah.ayahs }, 1)} className="flex h-13 items-center gap-2 rounded-full border border-ln2 px-6 font-semibold text-ac">
          <Icon name="play" className="size-5" /> শুনুন
        </button>
      </div>
    </section>
  );
}
