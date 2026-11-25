// Searching runs off the main thread so typing never stutters.
import { createHadithIndex, type HadithFilters, type HadithFound } from "@/lib/hadith/search";
import { createIndex, type Filters, type Found } from "./engine";

export type SearchRequest = { id: number; query: string; limit: number } & ({ scope: "quran"; filters: Filters } | { scope: "hadith"; filters: HadithFilters });
export type SearchReply = { id: number; found?: Found | HadithFound; failed?: true };

async function download(path: string) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/** Loads once; a failed download can be tried again. */
function once<T>(load: () => Promise<T>) {
  let pending: Promise<T> | null = null;
  return () => (pending ??= load().catch((error) => {
    pending = null;
    throw error;
  }));
}

const quran = once(() => download("/data/quran/search.json").then((data) => createIndex(data.rows, data.revelation)));
const hadith = once(() => download("/data/hadith/search.json").then((data) => createHadithIndex(data.rows)));

self.onmessage = async (event: MessageEvent<SearchRequest>) => {
  const request = event.data;
  const { id, query, limit } = request;
  try {
    const found = request.scope === "quran" ? (await quran())(query, request.filters, limit) : (await hadith())(query, request.filters, limit);
    self.postMessage({ id, found } satisfies SearchReply);
  } catch {
    self.postMessage({ id, failed: true } satisfies SearchReply);
  }
};
