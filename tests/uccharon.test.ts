import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MUQATTAAT, uccharon } from "../scripts/lib/uccharon.mjs";

type Surah = { basmalah: string | null; ayahs: { a: number; ar: string; tr: string }[] };
const surah = (n: number): Surah => JSON.parse(readFileSync(new URL(`../public/data/quran/${n}.json`, import.meta.url), "utf8"));
const say = (s: number, a: number) => uccharon(surah(s).ayahs[a - 1].ar, `${s}:${a}`);

describe("well known surahs, read in full", () => {
  it.each([
    [1, ["বিসমিল্লাহির রাহমানির রাহীম", "আলহামদু লিল্লাহি রাব্বিল আলামীন", "আর রাহমানির রাহীম", "মালিকি ইয়াওমিদ দীন", "ইয়্যাকা না’বুদু ওয়াইয়্যাকা নাসতাঈন", "ইহদিনাস সিরাতাল মুসতাকীম", "সিরাতাল্লাযীনা আনআমতা আলাইহিম গাইরিল মাগদূবি আলাইহিম ওয়ালাদ দাল্লীন"]],
    [112, ["কুল হুওয়াল্লাহু আহাদ", "আল্লাহুস সামাদ", "লাম ইয়ালিদ ওয়ালাম ইয়ূলাদ", "ওয়ালাম ইয়াকুল লাহূ কুফুওয়ান আহাদ"]],
    [113, ["কুল আঊযু বিরাব্বিল ফালাক", "মিন শার্‌রি মা খালাক", "ওয়ামিন শার্‌রি গাসিকিন ইযা ওয়াকাব", "ওয়ামিন শার্‌রিন নাফ্‌ফাছাতি ফিল উকাদ", "ওয়ামিন শার্‌রি হাসিদিন ইযা হাসাদ"]],
    [108, ["ইন্না আ’তাইনাকাল কাওছার", "ফাসাল্লি লিরাব্বিকা ওয়ানহার", "ইন্না শানিআকা হুওয়াল আবতার"]],
    [97, ["ইন্না আনযালনাহু ফী লাইলাতিল কাদর", "ওয়ামা আদরাকা মা লাইলাতুল কাদর", "লাইলাতুল কাদরি খাইরুম মিন আলফি শাহর"]],
  ])("surah %i", (n, lines) => {
    lines.forEach((line, i) => expect(say(n, i + 1)).toBe(line));
  });
});

describe("individual rules", () => {
  const has = (s: number, a: number, part: string) => expect(say(s, a)).toContain(part);

  it("tanween joins a following lam or ra", () => {
    has(2, 2, "হুদাল লিলমুত্তাকীন");
    has(2, 5, "হুদাম মির রাব্বিহিম");
  });
  it("noon turns into meem before ba", () => {
    has(2, 27, "মিম বা’দি");
    has(2, 10, "আলীমুম বিমা");
  });
  it("nasal glide before ya", () => has(2, 8, "মাইঁ ইয়াকূলু"));
  it("tanween before a joining alef is read with ni", () => has(2, 180, "খাইরানিল ওয়াসিয়্যাতু"));
  it("a doubled letter absorbs the unmarked one before it", () => has(2, 256, "কাত তাবাইয়্যানার রুশদু"));
  it("a vowel on small ya makes it a consonant", () => has(27, 36, "আতানিয়াল্লাহু"));
  it("imala is read as e", () => has(11, 41, "মাজরেহা"));
  it("small high noon is spoken", () => has(21, 88, "নুনজিল"));
  it("silent letters stay silent", () => has(2, 258, "কালা আনা উহইয়ী"));
  it("a verb at the very start gets its own opening vowel", () => expect(say(96, 1).startsWith("ইকরা’")).toBe(true));
  it("stopping turns ta marbuta into ha", () => expect(say(101, 1).endsWith("আহ")).toBe(true));
  it("reads disjointed letters by name", () => {
    expect(say(2, 1)).toBe("আলিফ লাম মীম");
    expect(say(36, 1)).toBe("ইয়া সীন");
    expect(say(10, 1).startsWith("আলিফ লাম রা ")).toBe(true);
    expect(Object.keys(MUQATTAAT)).toHaveLength(30);
  });
  it("refuses anything it does not understand", () => {
    expect(() => uccharon("abc بx")).toThrow();
    expect(() => uccharon("بٖ")).toThrow();
  });
});

describe("every ayah", () => {
  const all = Array.from({ length: 114 }, (_, i) => i + 1).flatMap((n) => surah(n).ayahs.map((x) => ({ key: `${n}:${x.a}`, tr: x.tr })));

  it("is built for all 6236", () => {
    expect(all).toHaveLength(6236);
    expect(all.filter((x) => !x.tr)).toEqual([]);
  });

  it.each([
    ["only Bangla letters", /[^ঀ-৿‌’ ,]/],
    ["no word starting with a vowel sign or stray mark", /(^| )[া-্‌’]/],
    ["no two vowel signs together", /[া-ৌ]{2}/],
    ["no vowel sign on a standalone vowel", /[অ-ঔ][া-ৌ]/],
    ["no word starting with a doubled consonant", /(^| )([ক-হ])্‌?\2/],
  ])("%s", (_, pattern) => {
    expect(all.filter((x) => pattern.test(x.tr)).map((x) => x.key)).toEqual([]);
  });
});
