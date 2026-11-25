"use client";

import { useMemo, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const memory = new Map<string, string>();

function read(key: string): string | null {
  const held = memory.get(key);
  if (held !== undefined) return held;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Saves to the device; if that fails the value is still kept for this visit. */
export function writeStored(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
    memory.delete(key);
  } catch {
    memory.set(key, value);
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useStored<T>(key: string, parse: (raw: string | null) => T): T {
  const raw = useSyncExternalStore(subscribe, () => read(key), () => null);
  return useMemo(() => parse(raw), [raw, parse]);
}

const never = () => () => {};
/** False while the page is being built or hydrated. */
export const useInBrowser = () => useSyncExternalStore(never, () => true, () => false);
