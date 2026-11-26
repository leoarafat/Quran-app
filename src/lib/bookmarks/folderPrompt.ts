// Which new bookmark is waiting for its folder. The sheet itself is placed once in the layout.
import { useSyncExternalStore } from "react";

export type Prompt = { surah: number; ayah: number } | null;

const listeners = new Set<() => void>();
let current: Prompt = null;

export function askFolder(next: Prompt) {
  current = next;
  listeners.forEach((l) => l());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export const useFolderPrompt = () => useSyncExternalStore(subscribe, () => current, () => null);
