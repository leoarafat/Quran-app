// Opens the verified publisher file. The database is extracted to a fresh temporary folder, read-only.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { sha256 } from "./quran.mjs";

const raw = new URL("../../data/raw/", import.meta.url);
export const ZIP = "hadeethenc/hadeethenc-bn-sqlite.zip";

export function readHadithSource() {
  const info = JSON.parse(readFileSync(new URL("MANIFEST.json", raw), "utf8"))[ZIP];
  const zip = new URL(ZIP, raw);
  if (!info || sha256(readFileSync(zip)) !== info.sha256) throw new Error(`Checksum mismatch: data/raw/${ZIP}`);

  const folder = mkdtempSync(join(tmpdir(), "noor-hadith-"));
  try {
    // "-p" streams the one expected entry, so nothing in the archive can choose where it is written.
    const bytes = execFileSync("unzip", ["-p", fileURLToPath(zip), "bn.sqlite"], { maxBuffer: 64 * 1024 * 1024 });
    const file = join(folder, "bn.sqlite");
    writeFileSync(file, bytes);
    const db = new DatabaseSync(file, { readOnly: true });
    const data = {
      info,
      hadiths: db.prepare("select id, title, hadeeth, explanation, hints, hadeeth_ar, grade, attribution, tarteeb from hadeeths order by id").all(),
      categories: db.prepare("select id, title, parent_id from categories order by id").all(),
      links: db.prepare("select category_id, hadeeth_id from category_hadeeth").all(),
    };
    db.close();
    return data;
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}
