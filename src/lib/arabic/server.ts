// Build-time only: the order in which ayahs are searched for example words.
import { getSurah } from "@/lib/quran/server";

/** Al-Fatiha first, then from the last surah backwards: the short surahs most people know. */
export function* exampleAyahs() {
  for (const n of [1, ...Array.from({ length: 113 }, (_, i) => 114 - i)]) {
    for (const x of getSurah(n).ayahs) yield { s: n, a: x.a, ar: x.ar };
  }
}
