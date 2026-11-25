// Build-time only: turns chosen references into the text from the data.
import type { ShownPassage } from "@/components/quran/QuranPassages";
import type { Passage } from "@/lib/topics";
import { getIndex, getSurah } from "./server";

export function getPassages(refs: readonly Passage[]): { passages: ShownPassage[]; credit: string } {
  const { surahs, sources } = getIndex();
  return {
    credit: `অনুবাদ: রুওয়্যাদ অনুবাদ কেন্দ্র (QuranEnc.com v${sources.translation.version}) · আরবি: Tanzil.net`,
    passages: refs.map(([s, from, to]) => ({ surah: s, surahName: surahs[s - 1].bangla, ayahs: getSurah(s).ayahs.slice(from - 1, to) })),
  };
}
