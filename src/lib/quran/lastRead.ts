"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Place } from "./types";

const KEY = "noor.lastRead.v1";

export function parsePlace(raw: string | null): Place | null {
  try {
    const p = JSON.parse(raw ?? "null");
    const ok = p && Number.isInteger(p.s) && p.s >= 1 && p.s <= 114 && Number.isInteger(p.a) && p.a >= 1 && p.a <= 286;
    return ok ? { s: p.s, a: p.a } : null;
  } catch {
    return null;
  }
}

export function saveLastRead(place: Place) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(place));
  } catch {
    // Not essential.
  }
}

function read(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

export function useLastRead(): Place | null {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  return useMemo(() => parsePlace(raw), [raw]);
}
