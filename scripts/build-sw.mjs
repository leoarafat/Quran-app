// Runs after the static export: lists what to keep for offline use and writes out/sw.js.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const out = join(root, "out");

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const toUrl = (file) => file.slice(out.length).split("\\").join("/");
const pathOf = (url) => join(out, url.endsWith("/") ? `${url}index.html` : url);

const PAGES = ["/", "/quran/", "/planner/", "/amal/", "/amal/surah/", "/amal/quran/", "/amal/daily/", "/amal/khatm/", "/amal/fasting/", "/amal/after-salah/", "/namaz/", "/namaz/kalema/", "/namaz/guruttho/", "/namaz/waqt/", "/namaz/jamat/", "/namaz/azan/", "/namaz/pobitrota/", "/namaz/oju/", "/namaz/gosol/", "/namaz/foroj/", "/namaz/niyot/", "/namaz/niyom/", "/namaz/nari/", "/namaz/juma/", "/namaz/tarabih/", "/namaz/eid/", "/namaz/janaza/", "/namaz/kafon-dafon/", "/namaz/qaza/", "/namaz/nofol/", "/namaz/proyojon-nofol/", "/namaz/surah-aro/", "/namaz/rakat/", "/namaz/surah/", "/namaz/doa/", "/namaz/masala/", "/ramadan/", "/hajj/", "/prophets/", "/zakat/", "/arabic/", "/arabic/makhraj/", "/arabic/tamiz/", "/arabic/mashq/", "/arabic/allah-lam/", "/arabic/ra/", "/arabic/practice/", "/arabic/joda/", "/arabic/horkot/", "/arabic/tanween/", "/arabic/sakin/", "/arabic/tashdid/", "/arabic/madd/", "/arabic/leen/", "/arabic/qalqalah/", "/arabic/gunnah/", "/arabic/noon/", "/arabic/meem/", "/arabic/mota/", "/arabic/waqf/", "/hadith/", "/search/", "/more/", "/bookmarks/", "/settings/", "/about/", "/me/", "/quiz/", "/data/", "/tasbih/", "/prayer-times/", "/qibla/", "/calendar/", "/offline/"];
const shell = [
  ...PAGES,
  // what the in-app router fetches when moving between those pages
  ...PAGES.map((p) => `${p}index.txt`),
  "/no-connection.html", "/manifest.webmanifest", "/icons/icon-192.png",
  // the search palette's surah list, so it can jump to a surah or ayah offline
  "/data/quran/index.json",
];
for (const url of shell) if (!existsSync(pathOf(url))) throw new Error(`Missing from the build: ${url}`);

const statics = walk(join(out, "_next", "static"))
  // the stray copy of the worker's TypeScript is never requested
  .filter((f) => !f.endsWith(".ts") && !f.endsWith(".map"))
  .map(toUrl).sort();

const hash = createHash("sha256");
for (const url of [...shell, ...statics]) hash.update(url).update(readFileSync(pathOf(url)));
hash.update(readFileSync(join(root, "scripts", "sw-template.js")));
const version = hash.digest("hex").slice(0, 12);

writeFileSync(join(out, "sw.js"), readFileSync(join(root, "scripts", "sw-template.js"), "utf8")
  .replace('"__VERSION__"', JSON.stringify(version))
  .replace("__STATIC_FILES__", JSON.stringify(statics))
  .replace("__SHELL_FILES__", JSON.stringify(shell)));

// The "keep the whole Quran offline" pack.
const surahs = Array.from({ length: 114 }, (_, i) => i + 1);
const pack = [...surahs.map((n) => `/quran/${n}/`), ...surahs.map((n) => `/data/quran/${n}.json`), "/data/quran/search.json"];
const bytes = pack.reduce((total, url) => total + statSync(pathOf(url)).size, 0);
writeFileSync(join(out, "offline-quran.json"), JSON.stringify({ version, bytes, urls: pack }));

const mb = (n) => (n / 1e6).toFixed(1);
console.log(`service worker ${version}: shell ${shell.length} files, static ${statics.length} files (${mb(statics.reduce((t, u) => t + statSync(pathOf(u)).size, 0))} MB), Quran pack ${mb(bytes)} MB`);
