// Saving recitation for offline listening. The service worker serves these copies.
import { ayahAudioUrl, RECITERS } from "@/lib/audio/reciters";
import type { Place, SurahInfo } from "@/lib/quran/types";

export const AUDIO_CACHE = "noor-audio";
export const SAVED_KEY = "noor.audio.saved.v1";

/** "s2" is surah 2, "j30" is para 30. */
export type Unit = { reciter: string; unit: string };
export type Saved = Unit & { bytes: number; ayahs: number };

export const savedId = (u: Unit) => `${u.reciter}:${u.unit}`;

export function ayahsOf(unit: string, surahs: SurahInfo[], juzs: Place[]): Place[] {
  const match = /^([sj])(\d+)$/.exec(unit);
  const n = Number(match?.[2]);
  if (match?.[1] === "s" && surahs[n - 1]) return Array.from({ length: surahs[n - 1].ayahs }, (_, i) => ({ s: n, a: i + 1 }));
  if (match?.[1] === "j" && juzs[n - 1]) {
    const start = juzs[n - 1];
    const end = juzs[n];
    const out: Place[] = [];
    for (let s = start.s; s <= (end?.s ?? surahs.length); s++) {
      const from = s === start.s ? start.a : 1;
      const to = end && s === end.s ? end.a - 1 : surahs[s - 1].ayahs;
      for (let a = from; a <= to; a++) out.push({ s, a });
    }
    return out;
  }
  return [];
}

export const urlsOf = (u: Unit, surahs: SurahInfo[], juzs: Place[]) => ayahsOf(u.unit, surahs, juzs).map((p) => ayahAudioUrl(u.reciter, p.s, p.a));

/** Files of `target` that no other saved item still needs (a para and a surah can share ayahs). */
export function removableUrls(target: Unit, others: Unit[], surahs: SurahInfo[], juzs: Place[]): string[] {
  const needed = new Set(others.filter((o) => savedId(o) !== savedId(target)).flatMap((o) => urlsOf(o, surahs, juzs)));
  return urlsOf(target, surahs, juzs).filter((url) => !needed.has(url));
}

export function parseSaved(raw: string | null): Saved[] {
  try {
    const list = JSON.parse(raw ?? "[]");
    if (!Array.isArray(list)) return [];
    return list.filter((x): x is Saved =>
      !!x && typeof x.unit === "string" && /^[sj]\d+$/.test(x.unit) && RECITERS.some((r) => r.id === x.reciter) && Number.isFinite(x.bytes) && Number.isInteger(x.ayahs));
  } catch {
    return [];
  }
}

export type Progress = { done: number; total: number; bytes: number };

/**
 * Downloads every ayah that is not already saved. Resolves with the total size.
 * Anything fetched stays saved if it stops early, so trying again carries on.
 */
export async function saveAll(
  urls: string[],
  cache: Pick<Cache, "match" | "put">,
  onProgress: (p: Progress) => void,
  signal: AbortSignal,
  fetcher: typeof fetch = fetch,
  parallel = 4,
): Promise<number> {
  let next = 0;
  let done = 0;
  let bytes = 0;
  let failure: unknown = null;

  async function one(url: string) {
    const existing = await cache.match(url);
    if (existing) return (await existing.blob()).size;
    for (let attempt = 1; ; attempt++) {
      try {
        const response = await fetcher(url, { signal, mode: "cors" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        if (blob.size === 0) throw new Error("Empty file");
        await cache.put(url, new Response(blob, { headers: { "Content-Type": "audio/mpeg", "Content-Length": String(blob.size) } }));
        return blob.size;
      } catch (error) {
        if (signal.aborted || (error as Error).name === "QuotaExceededError" || attempt === 3) throw error;
        await new Promise((r) => setTimeout(r, attempt * 800));
      }
    }
  }

  async function worker() {
    while (!failure && !signal.aborted && next < urls.length) {
      const url = urls[next++];
      try {
        // Await first: "bytes += await" would add to a total that other downloads have since changed.
        const size = await one(url);
        bytes += size;
        done++;
        onProgress({ done, total: urls.length, bytes });
      } catch (error) {
        failure ??= error;
      }
    }
  }

  onProgress({ done: 0, total: urls.length, bytes: 0 });
  await Promise.all(Array.from({ length: Math.min(parallel, urls.length) }, worker));
  if (signal.aborted) throw new DOMException("Stopped", "AbortError");
  if (failure) throw failure;
  return bytes;
}
