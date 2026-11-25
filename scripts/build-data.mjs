// Turns the verified source files into the JSON the app reads. Fails loudly on any mismatch.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import {
  divisionFinder, parseMetadata, parseTanzil, sha256, similarity, skeleton, splitBasmalah,
  TOTAL_AYAHS, TOTAL_SURAHS,
} from "./lib/quran.mjs";

const root = new URL("../", import.meta.url);
const raw = new URL("data/raw/", root);
const out = new URL("public/data/quran/", root);
const check = (condition, message) => { if (!condition) throw new Error(message); };

const manifest = JSON.parse(readFileSync(new URL("MANIFEST.json", raw), "utf8"));
function source(path) {
  const buffer = readFileSync(new URL(path, raw));
  check(manifest[path] && sha256(buffer) === manifest[path].sha256, `Checksum mismatch: data/raw/${path}`);
  return buffer.toString("utf8");
}

const uthmani = parseTanzil(source("tanzil/quran-uthmani.txt"));
const simple = parseTanzil(source("tanzil/quran-simple-clean.txt"));
const meta = parseMetadata(source("tanzil/quran-data.xml"));
const names = JSON.parse(readFileSync(new URL("content/surah-names-bn.json", root), "utf8")).names;

check(uthmani.verses.length === TOTAL_AYAHS, "Uthmani ayah count");
check(simple.verses.length === TOTAL_AYAHS, "Simple ayah count");
check(meta.surahs.length === TOTAL_SURAHS, "Surah count");
check(meta.surahs.every((s) => s.revelation), "Unknown revelation type");
check(meta.juzs.length === 30, "Juz count");
check(meta.pages.length === 604, "Page count");
check(meta.sajdas.length === 15, "Sajdah count");
check(names.length === TOTAL_SURAHS && new Set(names).size === TOTAL_SURAHS, "Bangla surah names");
check(uthmani.notice.includes("Tanzil Project"), "Tanzil copyright notice missing");

const juzOf = divisionFinder(meta.juzs);
const pageOf = divisionFinder(meta.pages);
const sajdas = new Set(meta.sajdas.map((p) => `${p.s}:${p.a}`));

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
writeFileSync(new URL("TANZIL-NOTICE.txt", out), uthmani.notice + "\n");

let cursor = 0;
let total = 0;
const alignment = [];
for (const surah of meta.surahs) {
  const translation = JSON.parse(source(`quranenc/bengali_rwwad/${surah.n}.json`)).result;
  check(translation.length === surah.ayahs, `Surah ${surah.n}: translation count`);
  let basmalah = null;
  const ayahs = translation.map((row, i) => {
    const a = i + 1;
    const arabic = uthmani.verses[cursor];
    const plain = simple.verses[cursor];
    cursor++;
    check(arabic.s === surah.n && arabic.a === a, `Uthmani order at ${surah.n}:${a}`);
    check(plain.s === surah.n && plain.a === a, `Simple order at ${surah.n}:${a}`);
    check(Number(row.sura) === surah.n && Number(row.aya) === a, `Translation order at ${surah.n}:${a}`);
    check(row.translation?.trim(), `Empty translation at ${surah.n}:${a}`);

    const split = splitBasmalah(surah.n, a, arabic.text);
    const plainSplit = splitBasmalah(surah.n, a, plain.text);
    basmalah ??= split.basmalah;

    // QuranEnc ships its own Arabic: comparing it proves each translation sits on the right ayah.
    const theirs = skeleton(row.arabic_text);
    const score = Math.max(
      similarity(skeleton(split.text), theirs),
      similarity(skeleton(plainSplit.text), theirs),
      similarity(skeleton(arabic.text), theirs),
    );
    alignment.push({ key: `${surah.n}:${a}`, score });
    total++;

    return {
      a,
      ar: split.text,
      arPlain: plainSplit.text,
      bn: row.translation,
      ...(row.footnotes ? { fn: row.footnotes } : {}),
      juz: juzOf(surah.n, a),
      page: pageOf(surah.n, a),
      ...(sajdas.has(`${surah.n}:${a}`) ? { sajdah: true } : {}),
    };
  });
  writeFileSync(new URL(`${surah.n}.json`, out), JSON.stringify({ n: surah.n, basmalah, ayahs }));
}
check(total === TOTAL_AYAHS, "Total ayah count");

alignment.sort((a, b) => a.score - b.score);
const weak = alignment.filter((x) => x.score < 0.6);
console.log("lowest alignment scores:", alignment.slice(0, 8).map((x) => `${x.key}=${x.score.toFixed(2)}`).join(" "));
check(weak.length === 0, `Translation may be misaligned at: ${weak.slice(0, 20).map((x) => x.key).join(", ")}`);

const index = {
  surahs: meta.surahs.map((s) => ({ ...s, bangla: names[s.n - 1] })),
  juzs: meta.juzs,
  sajdas: meta.sajdas,
  sources: {
    arabic: { name: "Tanzil Quran Text (Uthmani, Version 1.1)", url: "https://tanzil.net", license: "CC BY 3.0" },
    translation: {
      name: "বাংলা অনুবাদ: রুওয়্যাদ অনুবাদ কেন্দ্র",
      publisher: "QuranEnc.com",
      url: "https://quranenc.com/en/browse/bengali_rwwad",
      version: "1.1.4",
      fetched: manifest["quranenc/bengali_rwwad/1.json"].fetched,
    },
  },
};
writeFileSync(new URL("index.json", out), JSON.stringify(index));
console.log(`built ${meta.surahs.length} surahs, ${total} ayahs`);
