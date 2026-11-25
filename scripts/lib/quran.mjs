// Pure parsing and checking of the source files. Nothing here may alter Quran text:
// the only transformation is separating the opening Basmalah from ayah 1.
import { createHash } from "node:crypto";

export const TOTAL_SURAHS = 114;
export const TOTAL_AYAHS = 6236;

export const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

/** Arabic reduced to base letters, only for comparing and searching. */
export function skeleton(text) {
  return text
    .normalize("NFD")
    .replace(/[ً-ٰٟۖ-ۭـ]/g, "")
    .replace(/[ٱآأإ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

const BASMALAH_SKELETON = skeleton("بسم الله الرحمن الرحيم");

/** Tanzil "txt-2": `sura|aya|text` lines followed by a comment block that must be kept. */
export function parseTanzil(content) {
  const verses = [];
  const notice = [];
  for (const line of content.split(/\r?\n/)) {
    if (line.startsWith("#")) notice.push(line);
    else if (line.trim() !== "") {
      const match = /^(\d+)\|(\d+)\|(.+)$/.exec(line);
      if (!match) throw new Error(`Unexpected Tanzil line: ${line.slice(0, 80)}`);
      verses.push({ s: Number(match[1]), a: Number(match[2]), text: match[3] });
    }
  }
  return { verses, notice: notice.join("\n") };
}

/** Surah 1 keeps the Basmalah as ayah 1; surah 9 has none; elsewhere it is shown above ayah 1. */
export function splitBasmalah(surah, ayah, text) {
  if (ayah !== 1 || surah === 1 || surah === 9) return { basmalah: null, text };
  const words = text.split(" ");
  const head = words.slice(0, 4).join(" ");
  if (skeleton(head) !== BASMALAH_SKELETON || words.length < 5) {
    throw new Error(`Surah ${surah}: expected Basmalah before ayah 1`);
  }
  return { basmalah: head, text: words.slice(4).join(" ") };
}

const attributes = (tag) => Object.fromEntries([...tag.matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

export function parseMetadata(xml) {
  const all = (name) => [...xml.matchAll(new RegExp(`<${name} [^>]*/>`, "g"))].map((m) => attributes(m[0]));
  const position = (x) => ({ s: Number(x.sura), a: Number(x.aya) });
  return {
    surahs: all("sura").map((x) => ({
      n: Number(x.index),
      ayahs: Number(x.ayas),
      arabic: x.name,
      latin: x.tname,
      meaningEn: x.ename,
      revelation: x.type === "Meccan" ? "meccan" : x.type === "Medinan" ? "medinan" : null,
    })),
    juzs: all("juz").map(position),
    pages: all("page").map(position),
    sajdas: all("sajda").map(position),
    rukus: all("ruku").map(position),
    quarters: all("quarter").map(position),
    manzils: all("manzil").map(position),
  };
}

/** Returns a function giving the 1-based division (juz or page) that contains an ayah. */
export function divisionFinder(starts) {
  const key = (s, a) => s * 1000 + a;
  const keys = starts.map((p) => key(p.s, p.a));
  return (s, a) => {
    const k = key(s, a);
    let low = 0;
    let high = keys.length - 1;
    while (low < high) {
      const mid = (low + high + 1) >> 1;
      if (keys[mid] <= k) low = mid;
      else high = mid - 1;
    }
    return low + 1;
  };
}

function bigrams(text) {
  const flat = text.replace(/ /g, "");
  const out = new Map();
  for (let i = 0; i < flat.length - 1; i++) {
    const g = flat.slice(i, i + 2);
    out.set(g, (out.get(g) ?? 0) + 1);
  }
  return out;
}

/** 0..1 likeness of two skeletons; tolerant of spelling conventions between sources. */
export function similarity(a, b) {
  if (a === b) return 1;
  const x = bigrams(a);
  const y = bigrams(b);
  let shared = 0;
  let total = 0;
  for (const count of x.values()) total += count;
  for (const [g, count] of y) {
    total += count;
    shared += Math.min(count, x.get(g) ?? 0);
  }
  return total === 0 ? 0 : (2 * shared) / total;
}
