// Searching runs off the main thread so typing never stutters.
import { createIndex, type Filters, type Found } from "./engine";

export type SearchRequest = { id: number; query: string; filters: Filters; limit: number };
export type SearchReply = { id: number; found?: Found; failed?: true };

let index: Promise<ReturnType<typeof createIndex>> | null = null;

function load() {
  index ??= fetch("/data/quran/search.json")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => createIndex(data.rows, data.revelation))
    .catch((error) => {
      index = null; // allow a retry
      throw error;
    });
  return index;
}

self.onmessage = async (event: MessageEvent<SearchRequest>) => {
  const { id, query, filters, limit } = event.data;
  try {
    const search = await load();
    self.postMessage({ id, found: search(query, filters, limit) } satisfies SearchReply);
  } catch {
    self.postMessage({ id, failed: true } satisfies SearchReply);
  }
};
