"use client";

import { useSyncExternalStore } from "react";

function subscribe(tick: () => void) {
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
}

const second = () => Math.floor(Date.now() / 1000) * 1000;

/** Current time to the second; null while the page is being built or hydrated. */
export function useNow(): number | null {
  return useSyncExternalStore<number | null>(subscribe, second, () => null);
}
