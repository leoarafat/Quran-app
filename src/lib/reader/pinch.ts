import { SCALE_MAX, SCALE_MIN } from "@/lib/settings";

export type TextScales = { arScale: number; bnScale: number };

/** One step of the size sliders, so both ways of resizing land on the same sizes. */
const STEP = 10;

const resize = (start: number, ratio: number) => Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(start * ratio * STEP) / STEP));

/**
 * Sizes while two fingers are `ratio` times as far apart as when they touched.
 * Always worked out from the sizes at the start, so moving back gives them back exactly.
 */
export function pinchScales(start: TextScales, ratio: number): TextScales {
  if (!Number.isFinite(ratio) || ratio <= 0) return start;
  return { arScale: resize(start.arScale, ratio), bnScale: resize(start.bnScale, ratio) };
}
