"use client";

import { useEffect, useRef } from "react";
import { haptic } from "./haptic";

const HOLD = 500;
/** a finger that moves further than this is scrolling */
const SLOP = 10;

/**
 * Press and hold with a finger or pen. A mouse is left alone, so text can still be selected.
 * Spread the result on the element; presses that start on a control inside it are ignored.
 */
export function useLongPress(run: () => void) {
  const state = useRef<{ timer?: ReturnType<typeof setTimeout>; x: number; y: number; fired: boolean; touch: boolean }>({ x: 0, y: 0, fired: false, touch: false });
  const cancel = () => clearTimeout(state.current.timer);
  useEffect(() => cancel, []);

  return {
    onPointerDown: (e: React.PointerEvent) => {
      const s = state.current;
      cancel();
      s.fired = false;
      s.touch = e.pointerType !== "mouse";
      // A second finger means a pinch.
      if (!s.touch || !e.isPrimary || (e.target as HTMLElement).closest("button:not([data-long-press]), a, summary, dialog, [role=group]")) return;
      s.x = e.clientX;
      s.y = e.clientY;
      s.timer = setTimeout(() => {
        s.fired = true;
        haptic();
        run();
      }, HOLD);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (Math.hypot(e.clientX - state.current.x, e.clientY - state.current.y) > SLOP) cancel();
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    // Without this the click that ends the hold lands on whatever opened under the finger.
    onTouchEnd: (e: React.TouchEvent) => {
      cancel();
      if (state.current.fired && e.cancelable) e.preventDefault();
    },
    onTouchStart: (e: React.TouchEvent) => {
      if (e.touches.length > 1) cancel();
    },
    // The browser's own long-press menu.
    onContextMenu: (e: React.MouseEvent) => {
      if (state.current.touch) e.preventDefault();
    },
  };
}
