export type Mode =
  /** play only the chosen ayah */
  | "single"
  /** carry on to the end of the surah */
  | "continue";

export type PlayOptions = {
  mode: Mode;
  /** times each ayah is heard; 0 means until stopped */
  repeatEach: number;
  /** seconds of silence between plays */
  gap: number;
  rate: number;
};

export const REPEAT_CHOICES = [1, 2, 3, 5, 10, 0] as const;
export const GAP_CHOICES = [0, 2, 5, 10] as const;
export const RATE_CHOICES = [0.5, 0.75, 1, 1.25, 1.5] as const;
/** minutes until recitation pauses by itself; 0 is off */
export const SLEEP_CHOICES = [0, 5, 10, 15, 30, 60] as const;

export const DEFAULT_OPTIONS: PlayOptions = { mode: "continue", repeatEach: 1, gap: 0, rate: 1 };

export type Position = { ayah: number; plays: number; /** which time through a repeated passage this is, from 1 */ round?: number };

/** A passage heard several times over. `times` 0 means until stopped. */
export type Loop = { first: number; times: number };

/** What to play after the current recitation ends, or null to stop. `last` is the final ayah allowed. */
export function nextStep(current: Position, last: number, options: PlayOptions, loop?: Loop): Position | null {
  if (options.repeatEach === 0 || current.plays < options.repeatEach) {
    return { ...current, plays: current.plays + 1 };
  }
  // A chosen passage is always played through, whatever the single/continue choice says.
  if ((loop || options.mode === "continue") && current.ayah < last) return { ...current, ayah: current.ayah + 1, plays: 1 };
  const round = current.round ?? 1;
  if (loop && (loop.times === 0 || round < loop.times)) return { ayah: loop.first, plays: 1, round: round + 1 };
  return null;
}

/** Checks the ayah numbers a visitor typed for a passage. Numbers must already use ASCII digits. */
export function readRange(from: string, to: string, ayahs: number): { from: number; to: number } | null {
  const [a, b] = [from, to].map((text) => (/^\d+$/.test(text.trim()) ? Number(text.trim()) : NaN));
  return a >= 1 && b >= a && b <= ayahs ? { from: a, to: b } : null;
}

export type Track = {
  surah: number;
  surahName: string;
  /** last ayah this track may reach: the end of the surah, or of a chosen passage */
  total: number;
  /** first ayah of a chosen passage; the whole surah when absent */
  first?: number;
  /** set when the visitor asked to hear first..total repeatedly; 0 means until stopped */
  loop?: number;
  /** a playlist this track belongs to, heard one after another, and its place in it */
  list?: Track[];
  place?: number;
};

/**
 * What to recite after a track is finished: the next item of its playlist, or the next surah.
 * A passage chosen to be repeated, or a piece of a surah on its own, ends where it ends.
 */
export function followingTrack(track: Track, surahs: readonly { bangla: string; ayahs: number }[] | null): Track | null {
  if (track.loop !== undefined) return null;
  if (track.list) {
    const place = (track.place ?? 0) + 1;
    const item = track.list[place];
    return item ? { ...item, list: track.list, place } : null;
  }
  if (track.first !== undefined || !surahs || track.total !== surahs[track.surah - 1]?.ayahs) return null;
  const next = surahs[track.surah];
  return next ? { surah: track.surah + 1, surahName: next.bangla, total: next.ayahs } : null;
}
