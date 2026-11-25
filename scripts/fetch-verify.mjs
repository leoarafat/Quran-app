// Arabic hadith collections used ONLY to cross-check references. They are not published.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DIR = new URL("../data/verify/", import.meta.url);
const MANIFEST = new URL("MANIFEST.json", DIR);
export const BOOKS = ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah"];

mkdirSync(DIR, { recursive: true });
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
for (const book of BOOKS) {
  const name = `ara-${book}.min.json`;
  const target = new URL(name, DIR);
  const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${name}`;
  if (!existsSync(target)) {
    const response = await fetch(url, { signal: AbortSignal.timeout(240_000) });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  }
  const body = readFileSync(target);
  const sha256 = createHash("sha256").update(body).digest("hex");
  if (manifest[name] && manifest[name].sha256 !== sha256) throw new Error(`${name} differs from the recorded checksum`);
  manifest[name] ??= { url, fetched: new Date().toISOString().slice(0, 10), bytes: body.length, sha256 };
  console.log(name, JSON.parse(body.toString("utf8")).hadiths.length, "hadiths", (body.length / 1e6).toFixed(1), "MB");
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
