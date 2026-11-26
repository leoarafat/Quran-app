"use client";

import Link from "next/link";
import { toBnDigits } from "@/lib/bn";
import type { Ayah } from "@/lib/quran/types";
import { PinchArea } from "./PinchArea";
import { AyahCard } from "./AyahCard";

export type ShownPassage = { surah: number; surahName: string; ayahs: Ayah[] };

const ALL_LAYERS = { arabic: true, pronunciation: true, translation: true };

/** Chosen passages, each with the same controls as in the reader. */
/** `idPrefix` is needed only where one page shows the component more than once. */
export function QuranPassages({ passages, credit, idPrefix = "" }: { passages: ShownPassage[]; credit: string; idPrefix?: string }) {
  return (
    <PinchArea>
      <ol className="space-y-4">
        {passages.map(({ surah, surahName, ayahs }) => {
          const first = ayahs[0].a;
          const last = ayahs[ayahs.length - 1].a;
          const reference = `${toBnDigits(surah)}:${toBnDigits(first)}${last > first ? `-${toBnDigits(last)}` : ""}`;
          // Playback stays inside the passage: it never runs on into the rest of the surah.
          const track = { surah, surahName, first, total: last };
          return (
            <li key={`${surah}:${first}`} id={`${idPrefix}d${surah}-${first}`} className="scroll-mt-20 rounded-md border border-ln bg-sf px-2 pb-1 pt-1 shadow-card">
              <div className="flex items-center justify-between gap-2 px-1">
                <h2 className="min-w-0 truncate font-display font-semibold">সূরা {surahName} {reference}</h2>
                <Link href={`/quran/${surah}/#a${first}`} prefetch={false} aria-label={`সূরা ${surahName} ${reference} সূরায় পড়ুন`} className="flex min-h-11 shrink-0 items-center text-sm font-semibold text-ac underline">সূরায় পড়ুন</Link>
              </div>
              <ol>
                {ayahs.map((ayah) => <AyahCard key={ayah.a} ayah={ayah} track={track} layers={ALL_LAYERS} credit={credit} anchor={`${idPrefix}d${surah}-a${ayah.a}`} />)}
              </ol>
            </li>
          );
        })}
      </ol>
    </PinchArea>
  );
}
