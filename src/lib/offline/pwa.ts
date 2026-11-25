"use client";

import { useSyncExternalStore } from "react";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export type PwaState = { canInstall: boolean; installed: boolean; updateReady: boolean };

const SERVER: PwaState = { canInstall: false, installed: false, updateReady: false };
let state: PwaState = SERVER;
let prompt: InstallPrompt | null = null;
let waiting: ServiceWorker | null = null;
let accepted = false;
let started = false;
const listeners = new Set<() => void>();

function set(patch: Partial<PwaState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

/** Called once from the root layout: the install event fires early and only once. */
export function startPwa() {
  if (started) return;
  started = true;
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
  if (standalone) set({ installed: true });
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    prompt = event as InstallPrompt;
    set({ canInstall: true });
  });
  window.addEventListener("appinstalled", () => set({ installed: true, canInstall: false }));

  if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
  const found = (worker: ServiceWorker) => {
    waiting = worker;
    set({ updateReady: true });
  };
  navigator.serviceWorker.register("/sw.js").then((registration) => {
    if (registration.waiting && navigator.serviceWorker.controller) found(registration.waiting);
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      worker?.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) found(worker);
      });
    });
  }).catch(() => {
    // Private mode or blocked storage: the site still works online.
  });
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (accepted) window.location.reload();
  });
}

export async function install() {
  if (!prompt) return;
  const event = prompt;
  prompt = null;
  set({ canInstall: false });
  await event.prompt();
  await event.userChoice;
}

export function applyUpdate() {
  accepted = true;
  waiting?.postMessage("skip-waiting");
}

export function usePwa(): PwaState {
  return useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => state, () => SERVER);
}
