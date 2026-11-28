export type GradeClass = "sahih" | "hasan";

export type HadithCategory = { id: number; title: string; parent: number | null; count: number; children: number[]; hadiths: number[] };

export type HadithBook = { slug: string; title: string; hadiths: number[] };

export type HadithIndex = {
  meta: { publisher: string; url: string; version: string | null; fileDate: string; fetched: string; sha256: string; total: number };
  categories: HadithCategory[];
  books: HadithBook[];
  /** hadith id -> machine-matched Bukhari numbers */
  bukhariNumbers: Record<string, number[]>;
  /** id -> [title, grade class] */
  titles: Record<string, [string, GradeClass]>;
};

export type Hadith = {
  id: number;
  title: string;
  hadeeth: string;
  arabic: string;
  /** the publisher's own wording */
  grade: string;
  gradeClass: GradeClass;
  attribution: string;
  explanation: string;
  hints: string[];
  categories: number[];
  match: "strong" | "partial" | "none";
  /** found by machine in an independent collection */
  bukhari?: number[];
};
