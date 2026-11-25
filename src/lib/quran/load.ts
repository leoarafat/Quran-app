// A surah's words, fetched in the browser from the same files the offline pack keeps.
import type { SurahData } from "./types";

const cache = new Map<number, Promise<SurahData>>();

export function loadSurah(n: number): Promise<SurahData> {
  let request = cache.get(n);
  if (!request) {
    request = fetch(`/data/quran/${n}.json`).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<SurahData>;
    });
    cache.set(n, request);
    // A failed download can be tried again.
    request.catch(() => cache.delete(n));
  }
  return request;
}
