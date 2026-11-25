import { toAsciiDigits } from "@/lib/bn";
import type { SurahInfo } from "./types";

/** Folds spelling differences people commonly type, for matching surah names only. */
export function foldName(value: string): string {
  return toAsciiDigits(value)
    .normalize("NFD")
    .toLowerCase()
    .replace(/[\s\-'’‌‍়]/g, "")
    .replace(/ী/g, "ি") // long i -> short i
    .replace(/ূ/g, "ু") // long u -> short u
    .replace(/ee/g, "i") // "Yaseen" = "yasin"
    .replace(/oo/g, "u")
    .replace(/([a-z])\1+/g, "$1");
}

export type Reference = { surah: number; ayah: number };

/** Understands "2:255", "২:২৫৫" and "বাকারা ২৫৫". Returns null if the ayah does not exist. */
export function parseReference(query: string, surahs: SurahInfo[]): Reference | null {
  const text = toAsciiDigits(query).trim();
  const numeric = /^(\d{1,3})\s*[:：.]\s*(\d{1,3})$/.exec(text);
  let surah: SurahInfo | undefined;
  let ayah: number;
  if (numeric) {
    surah = surahs[Number(numeric[1]) - 1];
    ayah = Number(numeric[2]);
  } else {
    const named = /^(.*?\D)\s*[:：]?\s+(\d{1,3})$/.exec(text);
    if (!named) return null;
    const matches = filterSurahs(surahs, named[1]);
    if (matches.length !== 1) return null;
    surah = matches[0];
    ayah = Number(named[2]);
  }
  return surah && ayah >= 1 && ayah <= surah.ayahs ? { surah: surah.n, ayah } : null;
}

export function filterSurahs(surahs: SurahInfo[], query: string): SurahInfo[] {
  const q = foldName(query);
  if (!q) return surahs;
  if (/^\d+$/.test(q)) return surahs.filter((s) => s.n === Number(q));
  const matches = surahs.filter((s) => [s.bangla, s.latin, s.arabic].some((name) => foldName(name).includes(q)));
  // An exact name (with or without "al-") wins over longer names that merely contain it.
  const bare = (name: string) => foldName(name.replace(/^(আল|আন|আত|আয|আশ|আস|আদ|আর|al|an|at|az|ash|as|ad|ar)[-\s]/i, ""));
  const exact = matches.filter((s) => [s.bangla, s.latin].some((name) => foldName(name) === q || bare(name) === q));
  return exact.length === 1 ? exact : matches;
}
