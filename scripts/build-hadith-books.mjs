// The two full collections in Arabic -> one JSON file for each chapter. Texts are copied exactly.
// Source: data/raw/hadith-arabic/ (gzip of the files named in its MANIFEST.json).
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { sha256 } from "./lib/quran.mjs";

const root = new URL("../", import.meta.url);
const raw = new URL("data/raw/hadith-arabic/", root);
const out = new URL("public/data/books/", root);
const json = (url) => JSON.parse(readFileSync(url, "utf8"));
const check = (condition, message) => { if (!condition) throw new Error(message); };

const manifest = json(new URL("MANIFEST.json", raw));
const names = json(new URL("content/hadith-chapters.json", root));
const { checks } = json(new URL("content/hadith-checks.json", root));

const BOOKS = [
  { slug: "bukhari", title: "সহিহ বুখারী", file: "ara-bukhari.min.json", chapters: 98, offset: 1 },
  { slug: "muslim", title: "সহিহ মুসলিম", file: "ara-muslim.min.json", chapters: 57, offset: 0 },
];

/** Bukhari number -> ids of the Bangla hadiths whose Arabic was machine-matched to it. */
const bangla = new Map();
const published = json(new URL("public/data/hadith/index.json", root)).titles;
for (const [id, c] of Object.entries(checks)) {
  if (!published[id]) continue;
  for (const n of c.bukhari ?? []) bangla.set(n, [...(bangla.get(n) ?? []), Number(id)]);
}

rmSync(out, { recursive: true, force: true });
const index = [];
for (const book of BOOKS) {
  const bytes = gunzipSync(readFileSync(new URL(`${book.file}.gz`, raw)));
  check(sha256(bytes) === manifest.files[book.file].sha256, `Checksum mismatch: ${book.file}`);
  const data = JSON.parse(bytes.toString("utf8"));
  const last = Math.max(...Object.keys(data.metadata.sections).map(Number));
  check(last + 1 === book.chapters, `${book.slug}: expected chapters up to ${book.chapters - 1}, found ${last}`);
  check(names[book.slug].length === last + 1 - book.offset, `${book.slug}: chapter names do not match`);

  const chapters = new Map();
  let current = book.offset;
  let empty = 0;
  for (const h of data.hadiths) {
    // A few entries carry no chapter; they stay with the one before them, as they stand in the file.
    // Muslim's introduction is itself chapter 0 and covers the first 92 numbers.
    const own = h.reference?.book ?? 0;
    if (own > 0) current = own;
    else if (book.slug === "muslim" && h.hadithnumber <= 92) current = 0;
    if (!h.text.trim()) { empty++; continue; }
    if (!chapters.has(current)) chapters.set(current, []);
    const ids = book.slug === "bukhari" ? bangla.get(Math.floor(h.hadithnumber)) : undefined;
    chapters.get(current).push({ n: h.hadithnumber, t: h.text, ...(ids ? { bn: ids.slice(0, 3) } : {}) });
  }

  mkdirSync(new URL(`${book.slug}/`, out), { recursive: true });
  const list = [...chapters.keys()].sort((a, b) => a - b).map((id) => {
    const rows = chapters.get(id);
    writeFileSync(new URL(`${book.slug}/${id}.json`, out), JSON.stringify(rows));
    const numbers = rows.map((r) => r.n);
    return { id, title: names[book.slug][id - book.offset], english: data.metadata.sections[id].trim(), count: rows.length, first: Math.min(...numbers), last: Math.max(...numbers), bangla: rows.filter((r) => r.bn).length };
  });
  const total = list.reduce((n, c) => n + c.count, 0);
  check(total + empty === data.hadiths.length, `${book.slug}: entries were lost`);
  check(total > 7000, `${book.slug}: far fewer hadiths than expected`);
  index.push({ slug: book.slug, title: book.title, total, empty, bangla: list.reduce((n, c) => n + c.bangla, 0), chapters: list });
  console.log(`built ${book.slug}: ${total} hadiths in ${list.length} chapters; ${empty} empty entries left out`);
}
writeFileSync(new URL("index.json", out), JSON.stringify({ source: manifest.source, fetched: manifest.fetched, books: index }));
