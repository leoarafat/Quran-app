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

export const DEFAULT_OPTIONS: PlayOptions = { mode: "continue", repeatEach: 1, gap: 0, rate: 1 };

export type Position = { ayah: number; plays: number };

/** What to play after the current recitation ends, or null to stop. */
export function nextStep(current: Position, total: number, options: PlayOptions): Position | null {
  if (options.repeatEach === 0 || current.plays < options.repeatEach) {
    return { ayah: current.ayah, plays: current.plays + 1 };
  }
  if (options.mode === "continue" && current.ayah < total) return { ayah: current.ayah + 1, plays: 1 };
  return null;
}
