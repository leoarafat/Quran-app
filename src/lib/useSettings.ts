"use client";

import { useSyncExternalStore } from "react";
import { applySettings, DARK_QUERY, DEFAULT_SETTINGS, parseSettings, SETTINGS_KEY, type Settings } from "./settings";

const listeners = new Set<() => void>();
let current: Settings | null = null;

function read(): Settings {
  try {
    return parseSettings(window.localStorage.getItem(SETTINGS_KEY));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function getSnapshot(): Settings {
  current ??= read();
  return current;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== SETTINGS_KEY) return;
    current = read();
    applySettings(current, document.documentElement);
    listeners.forEach((l) => l());
  };
  window.addEventListener("storage", onStorage);
  // With the "system" choice the page follows the phone while it is open.
  const dark = window.matchMedia(DARK_QUERY);
  const onPhone = () => {
    if (getSnapshot().theme === "system") applySettings(getSnapshot(), document.documentElement);
    listener();
  };
  dark.addEventListener("change", onPhone);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
    dark.removeEventListener("change", onPhone);
  };
}

export function updateSettings(patch: Partial<Settings>): void {
  current = parseSettings(JSON.stringify({ ...getSnapshot(), ...patch }));
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(current));
  } catch {
    // Storage can be blocked (private mode). The change still applies to this visit.
  }
  applySettings(current, document.documentElement);
  listeners.forEach((l) => l());
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_SETTINGS);
}
