// Cross-checks every hadith against independent Arabic collections and records the result.
// Run after the source changes: node scripts/fetch-verify.mjs && node scripts/verify-hadith.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { arabicSkeleton, bestMatch, booksNamed, indexBook, matnOf } from "./lib/hadith.mjs";
import { readHadithSource } from "./lib/hadith-source.mjs";

const root = new URL("../", import.meta.url);
const read = (p) => JSON.parse(readFileSync(new URL(p, root), "utf8"));
const BOOKS = ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah"];
const collections = Object.fromEntries(BOOKS.map((b) => [b, read(`data/verify/ara-${b}.min.json`).hadiths]));

// The Bukhari numbers are shown to readers, so first prove the numbering is the usual one.
const ANCHORS = [[1, "انما الاعمال بالنيات"], [8, "بني الاسلام علي خمس"], [5027, "خيركم من تعلم القران وعلمه"], [6306, "سيد الاستغفار"]];
for (const [number, phrase] of ANCHORS) {
  const hadith = collections.bukhari.find((h) => h.hadithnumber === number);
  const text = arabicSkeleton(hadith?.text ?? "").replace(/انما الاعمال بالنيه/, "انما الاعمال بالنيات");
  if (!text.includes(arabicSkeleton(phrase))) throw new Error(`Bukhari numbering check failed at ${number}`);
}

const indexes = Object.fromEntries(BOOKS.map((b) => [b, indexBook(collections[b])]));
const STRONG = 0.8;
const PARTIAL = 0.6;
const checks = {};
for (const row of readHadithSource().hadiths) {
  const matn = matnOf(row.hadeeth_ar);
  let best = 0;
  let bukhari = null;
  for (const book of booksNamed(row.attribution)) {
    let match = bestMatch(indexes[book], matn.text);
    if (match.score < STRONG && matn.quoted) {
      const whole = bestMatch(indexes[book], row.hadeeth_ar);
      if (whole.score > match.score) match = whole;
    }
    best = Math.max(best, match.score);
    // A number is offered only for a strong match on a long enough text that points to a few places.
    if (book === "bukhari" && match.score >= STRONG && match.grams >= 6 && match.numbers.length <= 6) bukhari = match.numbers.slice(0, 3);
  }
  checks[row.id] = {
    match: best >= STRONG ? "strong" : best >= PARTIAL ? "partial" : "none",
    score: Math.round(best * 100) / 100,
    ...(bukhari ? { bukhari } : {}),
  };
}
const count = (m) => Object.values(checks).filter((c) => c.match === m).length;
const summary = { total: Object.keys(checks).length, strong: count("strong"), partial: count("partial"), none: count("none"), withBukhariNumber: Object.values(checks).filter((c) => c.bukhari).length };
const sources = read("data/verify/MANIFEST.json");
writeFileSync(new URL("content/hadith-checks.json", root), JSON.stringify({ _about: "Machine cross-check against independent Arabic collections. Not a scholarly verification.", checkedAgainst: Object.fromEntries(Object.entries(sources).map(([k, v]) => [k, v.sha256])), summary, checks }) + "\n");
console.log(summary);
