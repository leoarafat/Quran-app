// Downloads source files exactly as published and records their checksums.
// Existing files are never overwritten: delete one on purpose to refresh it.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const RAW = new URL("../data/raw/", import.meta.url);
const MANIFEST = new URL("MANIFEST.json", RAW);
const TANZIL = "https://tanzil.net/pub/download/index.php";

const files = [
  ["tanzil/quran-uthmani.txt", `${TANZIL}?quranType=uthmani&marks=true&sajdah=true&rub=true&tatweel=true&outType=txt-2&agree=true`],
  ["tanzil/quran-simple-clean.txt", `${TANZIL}?quranType=simple-clean&outType=txt-2&agree=true`],
  ["tanzil/quran-data.xml", "https://tanzil.net/res/text/metadata/quran-data.xml"],
  ...Array.from({ length: 114 }, (_, i) => [
    `quranenc/bengali_rwwad/${i + 1}.json`,
    `https://quranenc.com/api/v1/translation/sura/bengali_rwwad/${i + 1}`,
  ]),
];

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
let downloaded = 0;

for (const [path, url] of files) {
  const target = new URL(path, RAW);
  if (existsSync(target)) continue;
  let body;
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      body = Buffer.from(await res.arrayBuffer());
      break;
    } catch (error) {
      if (attempt === 3) throw new Error(`${url}: ${error.message}`);
      await new Promise((r) => setTimeout(r, attempt * 2000));
    }
  }
  writeFileSync(target, body);
  manifest[path] = {
    url,
    fetched: new Date().toISOString().slice(0, 10),
    bytes: body.length,
    sha256: createHash("sha256").update(body).digest("hex"),
  };
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  downloaded++;
}
console.log(`downloaded ${downloaded}, total tracked ${Object.keys(manifest).length}`);
