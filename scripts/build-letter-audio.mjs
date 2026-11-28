// Turns the recordings a person has matched by ear (content/letter-audio.json) into small MP3s.
// Needs ffmpeg, so it is run by hand and its output is committed.  node scripts/build-letter-audio.mjs
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { LETTERS } from "../src/lib/arabic/letters.ts";

const root = new URL("../", import.meta.url);
const raw = new URL("data/raw/commons-letters/", root);
const out = new URL("public/audio/letters/", root);
const { letters: chosen } = JSON.parse(readFileSync(new URL("content/letter-audio.json", root), "utf8"));
const known = new Set(LETTERS.map((l) => l.ch));
const manifest = Object.keys(chosen).length ? JSON.parse(readFileSync(new URL("MANIFEST.json", raw), "utf8")).files : {};
const used = new Set();

for (const [letter, file] of Object.entries(chosen)) {
  if (!known.has(letter)) throw new Error(`Unknown letter: ${letter}`);
  if (!Object.hasOwn(manifest, file)) throw new Error(`Not a downloaded recording: ${file}`);
  if (used.has(file)) throw new Error(`The same recording is chosen for two letters: ${file}`);
  used.add(file);
  if (createHash("sha1").update(readFileSync(new URL(file, raw))).digest("hex") !== manifest[file].sha1) throw new Error(`Checksum mismatch: ${file}`);
}

rmSync(out, { recursive: true, force: true });
const built = {};
for (const [i, l] of LETTERS.entries()) {
  const file = chosen[l.ch];
  if (!file) continue;
  mkdirSync(out, { recursive: true });
  const name = `${i + 1}.mp3`;
  // changes made: silence trimmed at both ends, loudness evened, mono MP3
  const trim = "silenceremove=start_periods=1:start_threshold=-45dB";
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", fileURLToPath(new URL(file, raw)), "-af", `${trim},areverse,${trim},areverse,loudnorm`, "-ac", "1", "-ar", "44100", "-b:a", "64k", fileURLToPath(new URL(name, out))]);
  built[l.ch] = { src: `/audio/letters/${name}`, from: manifest[file].page };
}
writeFileSync(new URL("src/lib/arabic/letter-audio.json", root), JSON.stringify(built, null, 1) + "\n");
console.log(`${Object.keys(built).length}/${LETTERS.length} letters have audio`);
