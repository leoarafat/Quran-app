// Build-time only.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Hadith, HadithCategory, HadithIndex } from "./types";

const dir = join(process.cwd(), "public", "data", "hadith");
const read = <T>(file: string): T => JSON.parse(readFileSync(join(dir, file), "utf8")) as T;

let cache: { index: HadithIndex; categories: Map<number, HadithCategory> } | null = null;

export function getHadithIndex() {
  if (!cache) {
    const index = read<HadithIndex>("index.json");
    cache = { index, categories: new Map(index.categories.map((c) => [c.id, c])) };
  }
  return cache;
}

export const getHadith = (id: number) => read<Hadith>(`item/${id}.json`);

/** From the top level down to the category itself. */
export function categoryPath(id: number): HadithCategory[] {
  const { categories } = getHadithIndex();
  const path: HadithCategory[] = [];
  for (let c = categories.get(id); c && !path.includes(c); c = c.parent ? categories.get(c.parent) : undefined) path.unshift(c);
  return path;
}
