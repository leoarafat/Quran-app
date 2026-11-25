"use client";

// One audio element for the whole app, so recitation survives moving between pages.
// Reusing the same element also gives the best chance of continuing on a locked phone.
import { useSyncExternalStore } from "react";
import { toBnDigits } from "@/lib/bn";
import { ayahAudioUrl, RECITERS } from "./reciters";
import { DEFAULT_OPTIONS, GAP_CHOICES, nextStep, RATE_CHOICES, REPEAT_CHOICES, type PlayOptions, type Position } from "./sequence";

export type Track = { surah: number; surahName: string; total: number };

export type PlayerState = {
  track: Track | null;
  position: Position;
  status: "idle" | "loading" | "playing" | "paused" | "waiting" | "error";
  reciter: string;
  options: PlayOptions;
};

const KEY = "noor.audio.v1";
const INITIAL: PlayerState = {
  track: null,
  position: { ayah: 1, plays: 1 },
  status: "idle",
  reciter: RECITERS[0].id,
  options: DEFAULT_OPTIONS,
};

let state: PlayerState = INITIAL;
let restored = false;
let element: HTMLAudioElement | null = null;
let gapTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function set(patch: Partial<PlayerState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function restore() {
  if (restored || typeof window === "undefined") return;
  restored = true;
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    if (!saved) return;
    const pick = <T,>(choices: readonly T[], value: unknown, fallback: T) => (choices.includes(value as T) ? (value as T) : fallback);
    state = {
      ...state,
      reciter: pick<string>(RECITERS.map((r) => r.id), saved.reciter, state.reciter),
      options: {
        mode: saved.options?.mode === "single" ? "single" : "continue",
        repeatEach: pick<number>(REPEAT_CHOICES, saved.options?.repeatEach, 1),
        gap: pick<number>(GAP_CHOICES, saved.options?.gap, 0),
        rate: pick<number>(RATE_CHOICES, saved.options?.rate, 1),
      },
    };
  } catch {
    // Unreadable storage: keep the defaults.
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ reciter: state.reciter, options: state.options }));
  } catch {
    // Not essential.
  }
}

function audio(): HTMLAudioElement {
  if (element) return element;
  element = new Audio();
  element.preload = "auto";
  element.addEventListener("playing", () => set({ status: "playing" }));
  element.addEventListener("waiting", () => { if (state.status === "playing") set({ status: "loading" }); });
  element.addEventListener("pause", () => {
    // Fires for system pauses (calls, headphones). Ignore the pause that comes with "ended".
    if (!element!.ended && (state.status === "playing" || state.status === "loading") && element!.paused) set({ status: "paused" });
  });
  element.addEventListener("error", () => { if (state.track) set({ status: "error" }); });
  element.addEventListener("ended", advance);
  setupMediaSession();
  return element;
}

function start(el: HTMLAudioElement) {
  el.playbackRate = state.options.rate;
  el.play().catch((error: DOMException) => {
    // AbortError only means a newer request replaced this one.
    if (error.name === "AbortError") return;
    set({ status: error.name === "NotAllowedError" ? "paused" : "error" });
  });
}

function load(position: Position) {
  const { track, reciter } = state;
  if (!track) return;
  clearTimeout(gapTimer);
  const el = audio();
  set({ position, status: "loading" });
  el.src = ayahAudioUrl(reciter, track.surah, position.ayah);
  el.defaultPlaybackRate = state.options.rate;
  updateMetadata();
  start(el);
}

function advance() {
  if (!state.track) return;
  const next = nextStep(state.position, state.track.total, state.options);
  if (!next) return stop();
  if (state.options.gap === 0) return load(next);
  set({ status: "waiting", position: next });
  gapTimer = setTimeout(() => load(next), state.options.gap * 1000);
}

export function playAyah(track: Track, ayah: number) {
  restore();
  set({ track });
  load({ ayah, plays: 1 });
}

export function toggle() {
  if (!state.track) return;
  if (state.status === "playing" || state.status === "loading") {
    set({ status: "paused" });
    audio().pause();
  } else if (state.status === "waiting") {
    clearTimeout(gapTimer);
    set({ status: "paused" });
    audio().removeAttribute("src");
  } else if (state.status === "error" || !audio().getAttribute("src")) {
    load(state.position);
  } else {
    set({ status: "loading" });
    start(audio());
  }
}

export function skip(delta: 1 | -1) {
  if (!state.track) return;
  const ayah = state.position.ayah + delta;
  if (ayah >= 1 && ayah <= state.track.total) load({ ayah, plays: 1 });
}

export function stop() {
  clearTimeout(gapTimer);
  if (element) {
    element.pause();
    element.removeAttribute("src");
    element.load();
  }
  set({ track: null, status: "idle", position: { ayah: 1, plays: 1 } });
  if (typeof navigator !== "undefined" && "mediaSession" in navigator) navigator.mediaSession.metadata = null;
}

export function setReciter(reciter: string) {
  restore();
  const active = state.status === "playing" || state.status === "loading" || state.status === "waiting";
  set({ reciter });
  persist();
  if (state.track) {
    if (active) load(state.position);
    else element?.removeAttribute("src");
  }
}

export function setOptions(patch: Partial<PlayOptions>) {
  restore();
  set({ options: { ...state.options, ...patch } });
  persist();
  if (element) element.playbackRate = element.defaultPlaybackRate = state.options.rate;
}

function setupMediaSession() {
  if (!("mediaSession" in navigator)) return;
  const handlers: [MediaSessionAction, () => void][] = [
    ["play", () => { if (state.status !== "playing") toggle(); }],
    ["pause", () => { if (state.status !== "paused") toggle(); }],
    ["previoustrack", () => skip(-1)],
    ["nexttrack", () => skip(1)],
    ["stop", stop],
  ];
  for (const [action, handler] of handlers) {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch {
      // Some browsers do not support every action.
    }
  }
}

function updateMetadata() {
  if (!state.track || !("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: `${state.track.surahName}, আয়াত ${toBnDigits(state.position.ayah)}`,
    artist: RECITERS.find((r) => r.id === state.reciter)?.name ?? "",
    album: "নূর কুরআন",
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!restored) {
    restore();
    listeners.forEach((l) => l());
  }
  return () => { listeners.delete(listener); };
}

export function usePlayer(): PlayerState {
  return useSyncExternalStore(subscribe, () => state, () => INITIAL);
}

/** Subscribe to a derived value so that rows only re-render when their own value changes. */
export function usePlayerValue<T extends string | number | boolean | null>(select: (s: PlayerState) => T): T {
  return useSyncExternalStore(subscribe, () => select(state), () => select(INITIAL));
}
