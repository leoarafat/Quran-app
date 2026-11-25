import { fold } from "@/lib/search/normalize";
import { termGroups, lineMatches, markWords, type Mode } from "@/lib/search/engine";
import type { GradeClass } from "./types";

/** [id, title, bangla, arabic, attribution, grade wording, grade class] */
export type HadithRow = [number, string, string, string, string, string, GradeClass];

export const BOOKS = [
  ["bukhari", "বুখারী", /বুখার/], ["muslim", "মুসলিম", /মুসলিম/], ["abudawud", "আবূ দাঊদ", /আবূ\s*দা[উঊ]দ|আবু\s*দা[উঊ]দ/],
  ["tirmidhi", "তিরমিযী", /তির(ি)?মিয/], ["nasai", "নাসাঈ", /নাসা(ঈ|য়ী|ই)/], ["ibnmajah", "ইবনে মাজাহ", /ইবন[েু]?\s*মাজাহ/],
] as const;

export type BookId = (typeof BOOKS)[number][0];
export type HadithFilters = { grade: "all" | GradeClass; book: "all" | BookId; mode: Mode };
export const DEFAULT_HADITH_FILTERS: HadithFilters = { grade: "all", book: "all", mode: "start" };

export type HadithResult = { id: number; title: string; snippet: string; marks: number[]; grade: string; gradeClass: GradeClass; attribution: string };
export type HadithFound = { total: number; results: HadithResult[]; synonyms: string[] };

function namesBook(attribution: string, book: BookId): boolean {
  const text = attribution.normalize("NFC");
  if ((book === "bukhari" || book === "muslim") && /মুত্তাফাক/.test(text)) return true;
  return BOOKS.find((b) => b[0] === book)![2].test(text);
}

/** A readable stretch of the hadith around the first matching word. */
function excerpt(text: string, marks: number[]): { snippet: string; marks: number[] } {
  const words = text.split(/\s+/).filter(Boolean);
  const from = Math.max(0, (marks[0] ?? 0) - 12);
  const to = Math.min(words.length, from + 36);
  const shift = from > 0 ? 1 : 0;
  return {
    snippet: [...(from > 0 ? ["…"] : []), ...words.slice(from, to), ...(to < words.length ? ["…"] : [])].join(" "),
    marks: marks.filter((i) => i >= from && i < to).map((i) => i - from + shift),
  };
}

export function createHadithIndex(rows: HadithRow[]) {
  const prepared = rows.map((row) => ({
    row,
    title: ` ${fold(row[1], "bangla")} `,
    bn: ` ${fold(row[2], "bangla")} `,
    ar: ` ${fold(row[3], "arabic")} `,
  }));

  return function search(query: string, filters: HadithFilters, limit: number): HadithFound {
    const arabic = /[ء-يٱ]/.test(query);
    const script = arabic ? "arabic" : "bangla";
    const folded = fold(query, script);
    if ((!arabic && !/[ঀ-৿]/.test(query)) || folded.replace(/ /g, "").length < 2) return { total: 0, results: [], synonyms: [] };
    const { groups, synonyms } = termGroups(folded, script);
    const matches = (line: string) => groups.every((g) => g.some((t) => lineMatches(line, t, filters.mode, script)));

    const hits: { item: (typeof prepared)[number]; rank: number }[] = [];
    for (const item of prepared) {
      if (filters.grade !== "all" && item.row[6] !== filters.grade) continue;
      if (filters.book !== "all" && !namesBook(item.row[4], filters.book)) continue;
      if (arabic) {
        if (matches(item.ar)) hits.push({ item, rank: item.ar.includes(folded) ? 0 : 1 });
      } else if (matches(item.title)) hits.push({ item, rank: 0 });
      else if (matches(item.bn)) hits.push({ item, rank: item.bn.includes(` ${folded}`) ? 1 : 2 });
    }
    hits.sort((a, b) => a.rank - b.rank);

    return {
      total: hits.length,
      synonyms: hits.length ? synonyms : [],
      results: hits.slice(0, limit).map(({ item }) => {
        const [id, title, bn, ar, attribution, grade, gradeClass] = item.row;
        const text = (arabic ? ar : bn).split(/\s+/).filter(Boolean).join(" ");
        return { id, title, ...excerpt(text, markWords(text, script, groups, filters.mode)), grade, gradeClass, attribution };
      }),
    };
  };
}
