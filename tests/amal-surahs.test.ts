import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AMAL_SURAHS } from "@/lib/amalSurahs";
import { followingTrack } from "@/lib/audio/sequence";
import { amalPlace, amalPlaylist } from "@/components/amalSurah/shared";

const json = (p: string) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));
const surahs = json("public/data/quran/index.json").surahs as { bangla: string; ayahs: number }[];
const counts = surahs.map((s) => s.ayahs);

describe("surahs for regular recitation", () => {
  it("has fifteen different passages that exist", () => {
    expect(AMAL_SURAHS).toHaveLength(15);
    expect(new Set(AMAL_SURAHS.map((x) => x.slug)).size).toBe(15);
    for (const x of AMAL_SURAHS) {
      expect(x.from).toBeGreaterThanOrEqual(1);
      expect(x.to).toBeLessThanOrEqual(counts[x.s - 1]);
      expect(x.to).toBeGreaterThanOrEqual(x.from);
    }
  });
  it("quotes only published sahih or hasan hadiths", () => {
    const titles = json("public/data/hadith/index.json").titles;
    for (const x of AMAL_SURAHS) for (const id of x.hadiths) expect(["sahih", "hasan"], `${x.slug}: ${id}`).toContain(titles[id]?.[1]);
  });
  it("is played one after another to the end", () => {
    const list = amalPlaylist(counts);
    let track: ReturnType<typeof followingTrack> = { ...list[0], list, place: 0 };
    const heard: string[] = [];
    while (track) { expect(amalPlace(track)).toBe(heard.length); heard.push(track.surahName); track = followingTrack(track, surahs); }
    expect(heard).toEqual(AMAL_SURAHS.map((x) => x.title));
    expect(amalPlace({ surah: 1, surahName: "x", total: 7 })).toBe(-1);
  });
  it("is kept for offline use", () => {
    const sw = readFileSync(new URL("../scripts/build-sw.mjs", import.meta.url), "utf8");
    expect(sw).toContain('"/amal/surah/"');
  });
});
