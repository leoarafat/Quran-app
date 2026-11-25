import { BOOKS, DEFAULT_HADITH_FILTERS, type HadithFilters } from "@/lib/hadith/search";
import { filterSurahs, foldName, parseReference } from "@/lib/quran/find";
import type { SurahInfo } from "@/lib/quran/types";
import { DEFAULT_FILTERS, type Filters } from "./engine";

/** Ayahs people ask for by a name. */
const NAMED = [{ title: "আয়াতুল কুরসি", surah: 2, ayah: 255, names: ["আয়াতুল কুরসি", "আয়াতুল কুরছি", "ayatul kursi", "ayatul kursy", "ayat al kursi", "آية الكرسي"] }];

export function directMatches(query: string, surahs: SurahInfo[]) {
  const folded = foldName(query);
  const named = folded.length >= 5 ? NAMED.find((n) => n.names.some((name) => foldName(name).startsWith(folded))) : undefined;
  const withoutWord = query.trim().replace(/^(সূরা|সুরা|surah|sura|سورة)\s+/i, "");
  const reference = parseReference(withoutWord, surahs);
  const matches = reference || foldName(withoutWord).length < 2 && !/^[0-9০-৯]+$/.test(withoutWord) ? [] : filterSurahs(surahs, withoutWord).slice(0, 4);
  return { named, reference, surahs: withoutWord ? matches : [] };
}

export function toParams(query: string, filters: Filters): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  for (const key of Object.keys(DEFAULT_FILTERS) as (keyof Filters)[]) {
    if (filters[key] !== DEFAULT_FILTERS[key]) params.set(key, String(filters[key]));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

export function fromParams(search: string): { query: string; filters: Filters } {
  const params = new URLSearchParams(search);
  const pick = <T extends string>(key: string, choices: readonly T[], fallback: T) => (choices.includes(params.get(key) as T) ? (params.get(key) as T) : fallback);
  const number = (key: string, max: number) => {
    const n = Number(params.get(key));
    return Number.isInteger(n) && n >= 0 && n <= max ? n : 0;
  };
  return {
    query: (params.get("q") ?? "").slice(0, 200),
    filters: {
      field: pick("field", ["all", "bn", "tr", "ar"], "all"),
      mode: pick("mode", ["start", "word", "any"], "start"),
      surah: number("surah", 114),
      juz: number("juz", 30),
      revelation: pick("revelation", ["all", "meccan", "medinan"], "all"),
    },
  };
}

export function hadithToParams(query: string, filters: HadithFilters): string {
  const params = new URLSearchParams({ scope: "hadith" });
  if (query) params.set("q", query);
  for (const key of Object.keys(DEFAULT_HADITH_FILTERS) as (keyof HadithFilters)[]) {
    if (filters[key] !== DEFAULT_HADITH_FILTERS[key]) params.set(key, filters[key]);
  }
  return `?${params.toString()}`;
}

export function hadithFromParams(search: string): { query: string; filters: HadithFilters } {
  const params = new URLSearchParams(search);
  const pick = <T extends string>(key: string, choices: readonly T[], fallback: T) => (choices.includes(params.get(key) as T) ? (params.get(key) as T) : fallback);
  return {
    query: (params.get("q") ?? "").slice(0, 200),
    filters: {
      grade: pick("grade", ["all", "sahih", "hasan"], "all"),
      book: pick("book", ["all", ...BOOKS.map((b) => b[0])], "all"),
      mode: pick("mode", ["start", "word", "any"], "start"),
    },
  };
}
