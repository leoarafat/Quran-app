import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import type { FullIndex } from "@/lib/hadith/books";

const file = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url));
const json = (p: string) => JSON.parse(file(p).toString("utf8"));
const index = json("public/data/books/index.json") as FullIndex;
type Row = { n: number; t: string; bn?: number[] };

describe("the full Arabic collections", () => {
  it("has Bukhari and Muslim with every chapter named", () => {
    expect(index.books.map((b) => b.slug)).toEqual(["bukhari", "muslim"]);
    expect(index.books[0].chapters).toHaveLength(97);
    expect(index.books[1].chapters).toHaveLength(57);
    for (const b of index.books) for (const c of b.chapters) expect(c.title, `${b.slug} ${c.id}`).toBeTruthy();
  });

  it.each(["bukhari", "muslim"])("%s keeps every text exactly as the source has it, losing none", (slug) => {
    const source = JSON.parse(gunzipSync(file(`data/raw/hadith-arabic/ara-${slug}.min.json.gz`)).toString("utf8")).hadiths as { hadithnumber: number; text: string }[];
    const book = index.books.find((b) => b.slug === slug)!;
    const built = new Map<number, string>();
    for (const c of book.chapters) for (const r of json(`public/data/books/${slug}/${c.id}.json`) as Row[]) { expect(built.has(r.n)).toBe(false); built.set(r.n, r.t); }
    const filled = source.filter((h) => h.text.trim());
    expect(built.size).toBe(filled.length);
    expect(book.total).toBe(filled.length);
    expect(book.total + book.empty).toBe(source.length);
    for (const h of filled) expect(built.get(h.hadithnumber)).toBe(h.text);
  });

  it("links to Bangla only where a published hadith was matched by number", () => {
    const published = json("public/data/hadith/index.json").titles;
    const numbers = json("public/data/hadith/index.json").bukhariNumbers as Record<string, number[]>;
    let linked = 0;
    for (const c of index.books[0].chapters) {
      for (const r of json(`public/data/books/bukhari/${c.id}.json`) as Row[]) {
        for (const id of r.bn ?? []) { expect(published[id]).toBeTruthy(); expect(numbers[id]).toContain(Math.floor(r.n)); linked++; }
      }
    }
    expect(linked).toBeGreaterThan(300);
    expect(index.books[1].bangla).toBe(0);
  });

  it("starts Bukhari with the hadith of intentions in the chapter of revelation", () => {
    const first = (json("public/data/books/bukhari/1.json") as Row[])[0];
    expect(first.n).toBe(1);
    expect(first.t.normalize("NFD").replace(/[ً-ٰٟـ]/g, "")).toContain("الاعمال");
  });
});
