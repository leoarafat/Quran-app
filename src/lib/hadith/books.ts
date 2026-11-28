// The two full collections (Arabic). Build-time reading of the chapter index.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type BookChapter = { id: number; title: string; english: string; count: number; first: number; last: number; /** hadiths that link to a Bangla translation */ bangla: number };
export type FullBook = { slug: string; title: string; total: number; empty: number; bangla: number; chapters: BookChapter[] };
export type FullIndex = { source: string; fetched: string; books: FullBook[] };

let cache: FullIndex | null = null;
export function getFullIndex(): FullIndex {
  cache ??= JSON.parse(readFileSync(join(process.cwd(), "public", "data", "books", "index.json"), "utf8")) as FullIndex;
  return cache;
}
export const getFullBook = (slug: string) => getFullIndex().books.find((b) => b.slug === slug);
