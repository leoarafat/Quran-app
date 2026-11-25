"use client";

import { useSyncExternalStore } from "react";
import { EMPTY, readLibrary, type Library } from "./model";

const KEY = "noor.bookmarks.v1";
/** Where unreadable saved data is set aside, so that saving again can never destroy it. */
const RESCUE_KEY = "noor.bookmarks.unreadable";

const listeners = new Set<() => void>();
let current: Library | null = null;
let unsaved = false;

/** null means storage cannot be read at all (blocked), so memory is the only copy. */
function readStored(): Library | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === null) return EMPTY;
    let parsed: Library | null = null;
    try {
      parsed = readLibrary(JSON.parse(raw));
    } catch {
      parsed = null;
    }
    if (parsed) return parsed;
    window.localStorage.setItem(RESCUE_KEY, raw);
    return EMPTY;
  } catch {
    return null;
  }
}

const load = (): Library => readStored() ?? current ?? EMPTY;

export function getLibrary(): Library {
  current ??= load();
  return current;
}

/** Applies a change on top of what is saved now. Returns false if the device would not store it. */
export function update(apply: (lib: Library) => Library): boolean {
  // Re-read first so a change made in another tab is not overwritten.
  // After a failed save the device copy is stale, so keep building on memory.
  const next = apply(unsaved && current ? current : load());
  current = next;
  let saved = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    saved = false;
  }
  unsaved = !saved;
  listeners.forEach((l) => l());
  return saved;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY && e.key !== null) return;
    current = load();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useLibrary(): Library {
  return useSyncExternalStore(subscribe, getLibrary, () => EMPTY);
}

/** For one ayah row, so only the row that changed re-renders. */
export function useIsBookmarked(s: number, a: number): boolean {
  return useSyncExternalStore(subscribe, () => getLibrary().items.some((b) => b.s === s && b.a === a), () => false);
}
