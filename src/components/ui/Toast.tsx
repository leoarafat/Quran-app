"use client";

import { useSyncExternalStore } from "react";

type Message = { id: number; text: string; action?: { label: string; run: () => void } };

const listeners = new Set<() => void>();
let current: Message | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let count = 0;

function set(next: Message | null) {
  current = next;
  listeners.forEach((l) => l());
}

/** One short message at a time. With an action (such as undo) it stays longer. */
export function showToast(text: string, action?: Message["action"], stay = action ? 6000 : 2500) {
  clearTimeout(timer);
  set({ id: ++count, text, action });
  timer = setTimeout(() => set(null), stay);
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

/** Placed once in the root layout. The live region is always there so that messages are announced. */
export function Toaster() {
  const message = useSyncExternalStore(subscribe, () => current, () => null);
  return (
    <div role="status" className="pointer-events-none fixed inset-x-4 top-[calc(var(--safe-top)+var(--header-h)+0.75rem)] z-[70] flex justify-center">
      {message && (
        <div key={message.id} className="pointer-events-auto flex min-h-12 w-full max-w-sm items-center justify-between gap-3 rounded-2xl bg-hero px-4 text-sm text-on-hero shadow-float [animation:rise_0.2s_ease-out_both]">
          <span className="py-2">{message.text}</span>
          {message.action && (
            <button type="button" className="min-h-11 shrink-0 font-semibold text-hero-accent" onClick={() => { message.action!.run(); set(null); }}>{message.action.label}</button>
          )}
        </div>
      )}
    </div>
  );
}
