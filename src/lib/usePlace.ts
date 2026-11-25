"use client";

import { useMemo, useSyncExternalStore } from "react";
import { CITIES, type Place } from "./prayer";

const KEY = "noor.place.v1";
const listeners = new Set<() => void>();
let memory: string | null = null;

export function parsePlace(raw: string | null): Place {
  try {
    const saved = JSON.parse(raw ?? "null");
    if (saved?.id === "here") {
      const { lat, lng, timeZone } = saved;
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && typeof timeZone === "string") {
        new Intl.DateTimeFormat("en", { timeZone }); // throws on an unknown zone
        return { id: "here", name: "আমার অবস্থান", lat, lng, timeZone };
      }
    }
    return CITIES.find((c) => c.id === saved?.id) ?? CITIES[0];
  } catch {
    return CITIES[0];
  }
}

function read(): string | null {
  try {
    return window.localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

export function savePlace(place: Place) {
  memory = JSON.stringify(place);
  try {
    window.localStorage.setItem(KEY, memory);
  } catch {
    // Kept for this visit only.
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

export function usePlace(): Place {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  return useMemo(() => parsePlace(raw), [raw]);
}
