import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { ayahsOf, parseSaved, removableUrls, saveAll, urlsOf, type Unit } from "@/lib/offline/audio";
import type { QuranIndex } from "@/lib/quran/types";

const root = new URL("../", import.meta.url);
const { surahs, juzs } = JSON.parse(readFileSync(new URL("public/data/quran/index.json", root), "utf8")) as QuranIndex;

describe("what a download contains", () => {
  it("covers each of the 6236 ayahs exactly once across the 30 paras", () => {
    const all = Array.from({ length: 30 }, (_, i) => ayahsOf(`j${i + 1}`, surahs, juzs)).flat();
    expect(all).toHaveLength(6236);
    expect(new Set(all.map((p) => `${p.s}:${p.a}`)).size).toBe(6236);
  });
  it("agrees with the para number stored on every ayah", () => {
    for (const j of [1, 2, 15, 29, 30]) {
      for (const p of ayahsOf(`j${j}`, surahs, juzs)) {
        const data = JSON.parse(readFileSync(new URL(`public/data/quran/${p.s}.json`, root), "utf8"));
        expect(data.ayahs[p.a - 1].juz).toBe(j);
      }
    }
  });
  it("lists a surah and rejects nonsense", () => {
    expect(ayahsOf("s112", surahs, juzs)).toHaveLength(4);
    for (const unit of ["s0", "s115", "j31", "x1", "s", ""]) expect(ayahsOf(unit, surahs, juzs), unit).toEqual([]);
  });
  it("keeps files another saved item still needs", () => {
    const surah: Unit = { reciter: "Alafasy_128kbps", unit: "s1" };
    const para: Unit = { reciter: "Alafasy_128kbps", unit: "j1" };
    expect(removableUrls(surah, [para], surahs, juzs)).toEqual([]);
    expect(removableUrls(para, [surah], surahs, juzs)).toHaveLength(urlsOf(para, surahs, juzs).length - 7);
    expect(removableUrls(surah, [{ ...para, reciter: "Husary_128kbps" }], surahs, juzs)).toHaveLength(7);
  });
  it("ignores a corrupt saved list", () => {
    for (const raw of [null, "x", "{}", '[{"unit":"s1","reciter":"nobody","bytes":1,"ayahs":1}]', "[null]"]) expect(parseSaved(raw)).toEqual([]);
  });
});

describe("saving audio", () => {
  const fakeCache = () => {
    const files = new Map<string, Blob>();
    return {
      files,
      match: async (url: RequestInfo | URL) => (files.has(String(url)) ? new Response(files.get(String(url))) : undefined),
      put: async (url: RequestInfo | URL, response: Response) => { files.set(String(url), await response.blob()); },
    };
  };
  const urls = ["u1", "u2", "u3", "u4", "u5", "u6"];
  const ok = vi.fn(async () => new Response("1234"));

  it("saves everything, reports progress and returns the size", async () => {
    const cache = fakeCache();
    const seen: number[] = [];
    const bytes = await saveAll(urls, cache, (p) => seen.push(p.done), new AbortController().signal, ok as unknown as typeof fetch);
    expect(bytes).toBe(24);
    expect(cache.files.size).toBe(6);
    expect(seen.at(-1)).toBe(6);
  });
  it("does not fetch what is already saved", async () => {
    const cache = fakeCache();
    await cache.put("u1", new Response("12"));
    const fetcher = vi.fn(async () => new Response("1234"));
    expect(await saveAll(urls, cache, () => {}, new AbortController().signal, fetcher as unknown as typeof fetch)).toBe(22);
    expect(fetcher).toHaveBeenCalledTimes(5);
  });
  it("never reports success when a file is missing or empty, and keeps the rest", async () => {
    for (const bad of [() => new Response("no", { status: 404 }), () => new Response("")]) {
      const cache = fakeCache();
      const fetcher = (async (url: string) => (url === "u4" ? bad() : new Response("1234"))) as unknown as typeof fetch;
      await expect(saveAll(urls, cache, () => {}, new AbortController().signal, fetcher, 1)).rejects.toThrow();
      expect(cache.files.has("u4")).toBe(false);
      expect(cache.files.size).toBe(3);
    }
  }, 15000);
  it("stops when asked", async () => {
    const controller = new AbortController();
    const fetcher = (async () => { controller.abort(); return new Response("1"); }) as unknown as typeof fetch;
    await expect(saveAll(urls, fakeCache(), () => {}, controller.signal, fetcher, 1)).rejects.toMatchObject({ name: "AbortError" });
  });
});

describe("service worker", () => {
  it("keeps the surah list the search palette asks for", () => {
    expect(readFileSync(new URL("scripts/build-sw.mjs", root), "utf8")).toContain('"/data/quran/index.json"');
    expect(readFileSync(new URL("src/components/search/CommandPalette.tsx", root), "utf8")).toContain('fetch("/data/quran/index.json")');
  });

  const template = readFileSync(new URL("scripts/sw-template.js", root), "utf8")
    .replace('"__VERSION__"', '"t"').replace("__STATIC_FILES__", "[]").replace("__SHELL_FILES__", "[]");
  const rangeResponse = new Function("self", `${template}; return rangeResponse;`)({ addEventListener() {} }) as (r: Response, h: string | null) => Promise<Response>;
  it("gives a worker script a rebuilt response, so the settings after # survive", () => {
    const forDestination = new Function("self", `${template}; return forDestination;`)({ addEventListener() {} }) as (q: { destination: string }, r: Response) => Response;
    const original = new Response("code", { headers: { "Content-Type": "text/javascript" } });
    expect(forDestination({ destination: "script" }, original)).toBe(original);
    const rebuilt = forDestination({ destination: "worker" }, original);
    expect(rebuilt).not.toBe(original);
    expect([rebuilt.url, rebuilt.headers.get("Content-Type")]).toEqual(["", "text/javascript"]);
  });

  const ask = async (header: string | null) => {
    const r = await rangeResponse(new Response("0123456789", { headers: { "Content-Type": "audio/mpeg" } }), header);
    return [r.status, r.headers.get("Content-Range"), await r.text()];
  };

  it.each([
    [null, [200, null, "0123456789"]],
    ["bytes=0-1", [206, "bytes 0-1/10", "01"]],
    ["bytes=4-", [206, "bytes 4-9/10", "456789"]],
    ["bytes=-3", [206, "bytes 7-9/10", "789"]],
    ["bytes=8-100", [206, "bytes 8-9/10", "89"]],
    ["bytes=10-", [416, "bytes */10", ""]],
    ["bytes=5-2", [416, "bytes */10", ""]],
    ["items=1-2", [200, null, "0123456789"]],
  ])("answers range %s", async (header, expected) => expect(await ask(header as string | null)).toEqual(expected));
});
