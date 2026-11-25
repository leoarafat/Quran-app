"use client";

import { useMemo, useSyncExternalStore } from "react";

const KEY = "noor.searches.v1";
const LIMIT = 8;
const listeners = new Set<() => void>();

export function parseHistory(raw: string | null): string[] {
  try {
    const list = JSON.parse(raw ?? "[]");
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === "string" && x.length > 0).slice(0, LIMIT) : [];
  } catch {
    return [];
  }
}

export const addToHistory = (list: string[], query: string) => [query, ...list.filter((x) => x !== query)].slice(0, LIMIT);

function read(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function write(list: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Not essential.
  }
  listeners.forEach((l) => l());
}

export const remember = (query: string) => { if (query.trim()) write(addToHistory(parseHistory(read()), query.trim())); };
export const clearHistory = () => write([]);

export function useHistory(): string[] {
  const raw = useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    read,
    () => null,
  );
  return useMemo(() => parseHistory(raw), [raw]);
}
