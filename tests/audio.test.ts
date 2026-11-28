import { describe, expect, it } from "vitest";
import { ayahAudioUrl, RECITERS } from "@/lib/audio/reciters";
import { DEFAULT_OPTIONS, followingTrack, nextStep, readRange, type PlayOptions, type Position } from "@/lib/audio/sequence";

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

describe("repeating a chosen passage", () => {
  const options = { ...DEFAULT_OPTIONS, repeatEach: 1 };

  /** Everything that gets recited, as "ayah" strings, until it stops or `limit` is reached. */
  function recite(last: number, loop: { first: number; times: number }, over: Partial<typeof options> = {}, limit = 50) {
    const heard: number[] = [];
    for (let at: Position | null = { ayah: loop.first, plays: 1 }; at && heard.length < limit; at = nextStep(at, last, { ...options, ...over }, loop)) heard.push(at.ayah);
    return heard;
  }

  it("hears the passage the chosen number of times and never leaves it", () => {
    expect(recite(5, { first: 3, times: 3 })).toEqual([3, 4, 5, 3, 4, 5, 3, 4, 5]);
  });
  it("repeats each ayah inside every round", () => {
    expect(recite(4, { first: 3, times: 2 }, { repeatEach: 2 })).toEqual([3, 3, 4, 4, 3, 3, 4, 4]);
  });
  it("plays the whole passage even if the player is set to a single ayah", () => {
    expect(recite(5, { first: 3, times: 1 }, { mode: "single" })).toEqual([3, 4, 5]);
  });
  it("works for one ayah, and goes on until stopped when asked", () => {
    expect(recite(7, { first: 7, times: 3 })).toEqual([7, 7, 7]);
    expect(recite(2, { first: 1, times: 0 }, {}, 9)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it("counts the rounds", () => {
    expect(nextStep({ ayah: 5, plays: 1, round: 2 }, 5, options, { first: 3, times: 3 })).toEqual({ ayah: 3, plays: 1, round: 3 });
    expect(nextStep({ ayah: 4, plays: 1, round: 2 }, 5, options, { first: 3, times: 3 })).toEqual({ ayah: 5, plays: 1, round: 2 });
    expect(nextStep({ ayah: 5, plays: 1, round: 3 }, 5, options, { first: 3, times: 3 })).toBeNull();
  });
  it("accepts only a passage that exists", () => {
    expect(readRange("3", " 7 ", 7)).toEqual({ from: 3, to: 7 });
    expect(readRange("4", "4", 7)).toEqual({ from: 4, to: 4 });
    for (const [a, b] of [["0", "3"], ["5", "4"], ["1", "8"], ["", "3"], ["1.5", "3"], ["-1", "3"], ["abc", "3"], ["1e0", "3"]]) expect(readRange(a, b, 7), `${a}-${b}`).toBeNull();
  });
});

describe("what plays after a surah", () => {
  const surahs = Array.from({ length: 114 }, (_, i) => ({ bangla: `সূরা ${i + 1}`, ayahs: i + 3 }));

  it("carries on to the next surah and stops after the last", () => {
    expect(followingTrack({ surah: 1, surahName: "x", total: 3 }, surahs)).toEqual({ surah: 2, surahName: "সূরা 2", total: 4 });
    expect(followingTrack({ surah: 114, surahName: "x", total: 116 }, surahs)).toBeNull();
    expect(followingTrack({ surah: 1, surahName: "x", total: 3 }, null)).toBeNull();
  });
  it("leaves a chosen passage or a piece of a surah where it ends", () => {
    expect(followingTrack({ surah: 2, surahName: "x", first: 1, total: 4, loop: 3 }, surahs)).toBeNull();
    expect(followingTrack({ surah: 2, surahName: "x", first: 2, total: 2 }, surahs)).toBeNull();
    expect(followingTrack({ surah: 2, surahName: "x", total: 3 }, surahs)).toBeNull();
  });
  it("goes through a playlist in order, whatever the pieces are", () => {
    const list = [{ surah: 2, surahName: "a", first: 3, total: 3 }, { surah: 67, surahName: "b", total: 30 }];
    const second = followingTrack({ ...list[0], list, place: 0 }, surahs);
    expect(second).toEqual({ ...list[1], list, place: 1 });
    expect(followingTrack(second!, surahs)).toBeNull();
  });
});
