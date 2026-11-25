import { describe, expect, it } from "vitest";
import { ayahAudioUrl, RECITERS } from "@/lib/audio/reciters";
import { DEFAULT_OPTIONS, nextStep, type PlayOptions, type Position } from "@/lib/audio/sequence";

function run(start: number, total: number, options: Partial<PlayOptions>, limit = 50): number[] {
  const heard: number[] = [];
  let at: Position | null = { ayah: start, plays: 1 };
  while (at && heard.length < limit) {
    heard.push(at.ayah);
    at = nextStep(at, total, { ...DEFAULT_OPTIONS, ...options });
  }
  return heard;
}

describe("playback order", () => {
  it("continues to the end of the surah and stops", () => expect(run(2, 4, {})).toEqual([2, 3, 4]));
  it("plays only one ayah in single mode", () => expect(run(2, 4, { mode: "single" })).toEqual([2]));
  it("repeats each ayah", () => expect(run(1, 2, { repeatEach: 3 })).toEqual([1, 1, 1, 2, 2, 2]));
  it("repeats one ayah in single mode", () => expect(run(1, 9, { mode: "single", repeatEach: 2 })).toEqual([1, 1]));
  it("repeats forever when asked", () => expect(run(3, 5, { repeatEach: 0 }, 6)).toEqual([3, 3, 3, 3, 3, 3]));
});

describe("audio addresses", () => {
  it("pads surah and ayah numbers", () => {
    expect(ayahAudioUrl("Alafasy_128kbps", 2, 255)).toBe("https://everyayah.com/data/Alafasy_128kbps/002255.mp3");
  });
  it("lists unique reciters", () => {
    expect(new Set(RECITERS.map((r) => r.id)).size).toBe(15);
  });
});
