// Publisher file -> the JSON the app reads. Texts are copied exactly as published.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { BOOK_TITLES, booksNamed, gradeClass } from "./lib/hadith.mjs";
import { readHadithSource } from "./lib/hadith-source.mjs";

const root = new URL("../", import.meta.url);
const out = new URL("public/data/hadith/", root);
const check = (condition, message) => { if (!condition) throw new Error(message); };

const source = readHadithSource();
const { checks } = JSON.parse(readFileSync(new URL("content/hadith-checks.json", root), "utf8"));

const held = { weak: [], review: [] };
const published = [];
for (const row of source.hadiths) {
  for (const field of ["title", "hadeeth", "hadeeth_ar", "grade", "attribution", "explanation"]) {
    check(row[field]?.trim(), `Hadith ${row.id}: empty ${field}`);
  }
  check(checks[row.id], `Hadith ${row.id} has not been cross-checked: run scripts/verify-hadith.mjs`);
  const cls = gradeClass(row.grade);
  if (cls === "weak" || cls === "review") held[cls].push(row.id);
  else published.push({ ...row, cls });
}
check(published.length > 1800, "Far fewer hadiths than expected");

const byId = new Map(published.map((h) => [h.id, h]));
const categories = new Map(source.categories.map((c) => [c.id, { id: c.id, title: c.title, parent: c.parent_id || null, direct: [], children: [] }]));
for (const c of categories.values()) if (c.parent) categories.get(c.parent).children.push(c.id);
for (const { category_id, hadeeth_id } of source.links) {
  if (byId.has(hadeeth_id)) categories.get(category_id).direct.push(hadeeth_id);
}
const subtree = (id, seen = new Set()) => {
  const c = categories.get(id);
  for (const h of c.direct) seen.add(h);
  for (const child of c.children) subtree(child, seen);
  return seen;
};
const order = (a, b) => byId.get(a).tarteeb - byId.get(b).tarteeb || a - b;
const list = [...categories.values()]
  .map((c) => ({ id: c.id, title: c.title, parent: c.parent, count: subtree(c.id).size, children: c.children, hadiths: [...new Set(c.direct)].sort(order) }))
  .filter((c) => c.count > 0);
const kept = new Set(list.map((c) => c.id));
for (const c of list) c.children = c.children.filter((id) => kept.has(id));

rmSync(out, { recursive: true, force: true });
mkdirSync(new URL("item/", out), { recursive: true });

const meta = {
  publisher: "HadeethEnc.com",
  url: "https://hadeethenc.com/bn/home",
  // The publisher's Bengali file states no version number; it is identified by its date and checksum.
  version: source.info.version,
  fileDate: source.info.fileDate,
  fetched: source.info.fetched,
  sha256: source.info.sha256,
  total: published.length,
};

for (const h of published) {
  const { match, bukhari } = checks[h.id];
  writeFileSync(new URL(`item/${h.id}.json`, out), JSON.stringify({
    id: h.id, title: h.title, hadeeth: h.hadeeth, arabic: h.hadeeth_ar, grade: h.grade, gradeClass: h.cls,
    attribution: h.attribution, explanation: h.explanation, hints: JSON.parse(h.hints || "[]"),
    categories: list.filter((c) => c.hadiths.includes(h.id)).map((c) => c.id),
    match, ...(bukhari ? { bukhari } : {}),
  }));
}
// Which collections the publisher's attribution line names. A hadith can be in several.
// This is the publisher's selection grouped by book, never the complete printed book.
const named = published.map((h) => [h.id, booksNamed(h.attribution)]);
const books = Object.entries(BOOK_TITLES).map(([slug, title]) => ({
  slug, title, hadiths: named.filter(([, list]) => list.includes(slug)).map(([id]) => id).sort(order),
}));

writeFileSync(new URL("index.json", out), JSON.stringify({
  meta,
  books,
  bukhariNumbers: Object.fromEntries(published.filter((h) => checks[h.id].bukhari).map((h) => [h.id, checks[h.id].bukhari])),
  categories: list,
  titles: Object.fromEntries(published.map((h) => [h.id, [h.title, h.cls]])),
}));
writeFileSync(new URL("search.json", out), JSON.stringify({
  source: `${meta.publisher}, ${meta.fileDate}`,
  rows: published.map((h) => [h.id, h.title, h.hadeeth, h.hadeeth_ar, h.attribution, h.grade, h.cls]),
}));
console.log(`built ${published.length} hadiths, ${list.length} categories; held back: ${held.weak.length} weak (${held.weak}), ${held.review.length} unclear grade (${held.review})`);
