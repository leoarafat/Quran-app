import { fold, type Script } from "./normalize";

/** [surah, ayah, juz, arabic, plainArabic, pronunciation, translation] */
export type Row = [number, number, number, string, string, string, string];

export type Field = "all" | "bn" | "tr" | "ar";
export type Mode =
  /** the typed word starts a word, so endings still match: "সালাত" finds "সালাতের" */
  | "start"
  | "word"
  | "any";

export type Filters = {
  field: Field;
  mode: Mode;
  surah: number;
  juz: number;
  revelation: "all" | "meccan" | "medinan";
};

export const DEFAULT_FILTERS: Filters = { field: "all", mode: "start", surah: 0, juz: 0, revelation: "all" };

export type Result = {
  s: number;
  a: number;
  ar: string;
  tr: string;
  bn: string;
  /** indexes of the space-separated words to highlight */
  marks: { ar: number[]; tr: number[]; bn: number[] };
};

export type Found = { total: number; results: Result[]; synonyms: string[] };

// Words people say that this translation writes differently.
const SYNONYMS = [
  ["নামাজ", "সালাত"],
  ["রোজা", "সিয়াম", "সাওম"],
  ["বেহেশত", "জান্নাত"],
  ["দোজখ", "জাহান্নাম"],
  ["সবর", "ধৈর্য"],
  ["প্রতিপালক", "পালনকর্তা", "রব"],
].map((group) => group.map((word) => ({ word, key: fold(word, "bangla") })));

const ARABIC_PREFIXES = ["", "ال", "و", "ف", "ب", "ك", "ل", "وال", "فال", "بال", "كال", "لل", "ولل", "وب", "ول", "فب", "فل"];

type Term = { text: string; /** added by the app, so only matched at the start of a word */ synonym: boolean };

function termGroups(query: string, script: Script): { groups: Term[][]; synonyms: string[] } {
  const synonyms: string[] = [];
  const groups = query.split(" ").filter(Boolean).map((token) => {
    const terms: Term[] = [{ text: token, synonym: false }];
    if (script === "bangla") {
      for (const group of SYNONYMS) {
        const hit = group.find((g) => token === g.key || (g.key.length > 2 && token.startsWith(g.key)));
        if (!hit) continue;
        for (const other of group) {
          if (other === hit) continue;
          terms.push({ text: other.key, synonym: true });
          synonyms.push(other.word);
        }
      }
    }
    return terms;
  });
  return { groups, synonyms };
}

/** Does one folded word satisfy the term? */
function wordMatches(word: string, term: Term, mode: Mode, script: Script): boolean {
  if (mode === "word") return word === term.text;
  if (term.synonym) return word.startsWith(term.text);
  if (mode === "any") return word.includes(term.text);
  if (script === "arabic") return ARABIC_PREFIXES.some((p) => word.startsWith(p + term.text));
  return word.startsWith(term.text);
}

/** Same test against a whole " word word " string, written to be fast over 6236 rows. */
function lineMatches(line: string, term: Term, mode: Mode, script: Script): boolean {
  if (mode === "word") return line.includes(` ${term.text} `);
  if (term.synonym) return line.includes(` ${term.text}`);
  if (mode === "any") return line.includes(term.text);
  if (script === "arabic") return line.includes(term.text) && ARABIC_PREFIXES.some((p) => line.includes(` ${p}${term.text}`));
  return line.includes(` ${term.text}`);
}

type Joined = { text: string; starts: Set<number>; ends: Set<number> };

/** Pronunciation is matched ignoring spaces, since people join words differently. */
function joinWords(text: string): Joined {
  const starts = new Set<number>();
  const ends = new Set<number>();
  let joined = "";
  for (const word of fold(text, "pronunciation").split(" ")) {
    starts.add(joined.length);
    joined += word;
    ends.add(joined.length);
  }
  return { text: joined, starts, ends };
}

function findJoined(line: Joined, needle: string, mode: Mode): number {
  for (let at = line.text.indexOf(needle); at >= 0; at = line.text.indexOf(needle, at + 1)) {
    if (mode === "any") return at;
    if (line.starts.has(at) && (mode === "start" || line.ends.has(at + needle.length))) return at;
  }
  return -1;
}

type Prepared = { row: Row; bn: string; tr: Joined; ar: string; arPlain: string };

export function createIndex(rows: Row[], revelation: ("meccan" | "medinan")[]) {
  const prepared: Prepared[] = rows.map((row) => ({
    row,
    ar: ` ${fold(row[3], "arabic")} `,
    arPlain: ` ${fold(row[4], "arabic")} `,
    tr: joinWords(row[5]),
    bn: ` ${fold(row[6], "bangla")} `,
  }));

  function markWords(text: string, script: Script, groups: Term[][], mode: Mode): number[] {
    return text.split(" ").flatMap((word, i) => {
      const parts = fold(word, script).split(" ").filter(Boolean);
      return parts.some((part) => groups.some((g) => g.some((t) => wordMatches(part, t, mode, script)))) ? [i] : [];
    });
  }

  function markSound(text: string, needle: string, mode: Mode): number[] {
    const words = text.split(" ");
    const parts: { from: number; to: number; word: number }[] = [];
    let joined = "";
    words.forEach((word, i) => {
      for (const part of fold(word, "pronunciation").split(" ")) {
        parts.push({ from: joined.length, to: joined.length + part.length, word: i });
        joined += part;
      }
    });
    const line = joinWords(text);
    const at = findJoined(line, needle, mode);
    if (at < 0) return [];
    return [...new Set(parts.filter((p) => p.from < at + needle.length && p.to > at && p.to > p.from).map((p) => p.word))];
  }

  return function search(query: string, filters: Filters, limit: number): Found {
    const empty: Found = { total: 0, results: [], synonyms: [] };
    const isArabic = /[ء-يٱ]/.test(query);
    if (!isArabic && !/[ঀ-৿]/.test(query)) return empty;
    const fields: Exclude<Field, "all">[] = isArabic ? ["ar"] : filters.field === "all" ? ["bn", "tr"] : filters.field === "ar" ? [] : [filters.field];
    if (isArabic && filters.field !== "all" && filters.field !== "ar") return empty;

    const arabicQuery = fold(query, "arabic");
    const banglaQuery = fold(query, "bangla");
    const sound = fold(query.replace(/ক্ব/g, "ক"), "pronunciation").replace(/ /g, "");
    // One letter would match nearly everything.
    if ((isArabic ? arabicQuery : banglaQuery).replace(/ /g, "").length < 2) return empty;

    const arabic = termGroups(arabicQuery, "arabic");
    const bangla = termGroups(banglaQuery, "bangla");
    const hits: { item: Prepared; rank: number; matched: Set<string> }[] = [];

    for (const item of prepared) {
      const [s, , juz] = item.row;
      if (filters.surah && s !== filters.surah) continue;
      if (filters.juz && juz !== filters.juz) continue;
      if (filters.revelation !== "all" && revelation[s - 1] !== filters.revelation) continue;

      let rank = Infinity;
      const matched = new Set<string>();
      if (fields.includes("ar")) {
        for (const line of [item.arPlain, item.ar]) {
          if (arabic.groups.every((g) => g.some((t) => lineMatches(line, t, filters.mode, "arabic")))) {
            matched.add("ar");
            rank = Math.min(rank, line.includes(arabicQuery) ? 0 : 1);
          }
        }
      }
      if (fields.includes("bn") && bangla.groups.every((g) => g.some((t) => lineMatches(item.bn, t, filters.mode, "bangla")))) {
        matched.add("bn");
        rank = Math.min(rank, item.bn.includes(` ${banglaQuery}`) ? 0 : 2);
      }
      if (fields.includes("tr") && sound.length >= 3 && findJoined(item.tr, sound, filters.mode) >= 0) {
        matched.add("tr");
        rank = Math.min(rank, 1);
      }
      if (matched.size) hits.push({ item, rank, matched });
    }

    hits.sort((x, y) => x.rank - y.rank); // stable: Quran order within the same rank
    return {
      total: hits.length,
      synonyms: hits.length && fields.includes("bn") ? bangla.synonyms : [],
      results: hits.slice(0, limit).map(({ item, matched }) => {
        const [s, a, , ar, , tr, bn] = item.row;
        return {
          s, a, ar, tr, bn,
          marks: {
            ar: matched.has("ar") ? markWords(ar, "arabic", arabic.groups, filters.mode) : [],
            tr: matched.has("tr") ? markSound(tr, sound, filters.mode) : [],
            bn: matched.has("bn") ? markWords(bn, "bangla", bangla.groups, filters.mode) : [],
          },
        };
      }),
    };
  };
}
