// Build-time only: reads the generated JSON while pages are pre-rendered.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Ayah, QuranIndex, SurahData } from "./types";

const dir = join(process.cwd(), "public", "data", "quran");
const read = <T>(file: string): T => JSON.parse(readFileSync(join(dir, file), "utf8")) as T;

export const getIndex = () => read<QuranIndex>("index.json");

type BuiltAyah = Ayah & { arPlain: string };

export function getSurah(n: number): SurahData {
  const data = read<Omit<SurahData, "ayahs"> & { ayahs: BuiltAyah[] }>(`${n}.json`);
  return {
    ...data,
    // The plain spelling is only for search; pick fields so it is not sent to the reader page.
    ayahs: data.ayahs.map(({ a, ar, bn, fn, juz, page, sajdah }) => ({ a, ar, bn, fn, juz, page, sajdah })),
  };
}
