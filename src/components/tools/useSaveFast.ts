"use client";

import { FASTS_KEY, readFasts, toggleFast, EMPTY_FASTS } from "@/lib/tools/fastlog";
import { writeStored } from "@/lib/useStored";

const RESCUE_KEY = "noor.fasts.unreadable";

/** Ticks or unticks one day. Saved data that cannot be read is set aside first, never overwritten. */
export function useSaveFast() {
  return (day: string) => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(FASTS_KEY);
    } catch {
      // Nothing saved can be read, so there is nothing to protect.
    }
    const fasts = raw === null ? EMPTY_FASTS : readFasts(raw);
    if (raw !== null && fasts === null) writeStored(RESCUE_KEY, raw);
    writeStored(FASTS_KEY, JSON.stringify(toggleFast(fasts ?? EMPTY_FASTS, day)));
  };
}
