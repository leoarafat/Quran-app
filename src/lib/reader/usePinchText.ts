"use client";

import { useCallback, useState } from "react";
import { updateSettings } from "@/lib/useSettings";
import { parseSettings, SETTINGS_KEY } from "@/lib/settings";
import { pinchScales, type TextScales } from "./pinch";

const distance = (a: Touch, b: Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

function currentScales(): TextScales {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string) => Number(style.getPropertyValue(name)) || 1;
  const saved = (() => { try { return parseSettings(window.localStorage.getItem(SETTINGS_KEY)); } catch { return null; } })();
  return { arScale: saved?.arScale ?? read("--ar-scale"), bnScale: saved?.bnScale ?? read("--bn-scale") };
}

/**
 * Two fingers on the text change its size instead of zooming the whole page.
 * Returns a ref for the text area, and the sizes while a pinch is going on.
 * The area also needs the CSS `touch-action: pan-x pan-y`.
 */
export function usePinchText(): [(node: HTMLElement | null) => (() => void) | undefined, TextScales | null] {
  const [active, setActive] = useState<TextScales | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    let pinch: { apart: number; start: TextScales; last: TextScales; anchor: Element | null; at: number; y: number } | null = null;

    const begin = (event: TouchEvent) => {
      if (event.touches.length !== 2) return end();
      const [a, b] = [event.touches[0], event.touches[1]];
      const apart = distance(a, b);
      if (apart < 10) return;
      const y = (a.clientY + b.clientY) / 2;
      // The line between the fingers should stay between them while the text grows around it.
      const under = document.elementFromPoint((a.clientX + b.clientX) / 2, y);
      const anchor = under && node.contains(under) ? under : null;
      const box = anchor?.getBoundingClientRect();
      const start = currentScales();
      pinch = { apart, start, last: start, anchor, at: box && box.height ? (y - box.top) / box.height : 0, y };
    };

    const move = (event: TouchEvent) => {
      if (!pinch || event.touches.length !== 2) return;
      if (event.cancelable) event.preventDefault();
      const next = pinchScales(pinch.start, distance(event.touches[0], event.touches[1]) / pinch.apart);
      setActive(next);
      if (next.arScale === pinch.last.arScale && next.bnScale === pinch.last.bnScale) return;
      pinch.last = next;
      updateSettings(next);
      if (pinch.anchor) {
        const box = pinch.anchor.getBoundingClientRect();
        window.scrollBy({ top: box.top + box.height * pinch.at - pinch.y, behavior: "instant" });
      }
    };

    function end() {
      if (!pinch) return;
      pinch = null;
      setActive(null);
    }
    const lift = (event: TouchEvent) => { if (event.touches.length < 2) end(); };
    // Safari zooms the page from its own gesture events, whatever touch-action says.
    const stopPageZoom = (event: Event) => event.preventDefault();

    node.addEventListener("touchstart", begin, { passive: true });
    node.addEventListener("touchmove", move, { passive: false });
    node.addEventListener("touchend", lift);
    node.addEventListener("touchcancel", lift);
    node.addEventListener("gesturestart", stopPageZoom);
    return () => {
      node.removeEventListener("touchstart", begin);
      node.removeEventListener("touchmove", move);
      node.removeEventListener("touchend", lift);
      node.removeEventListener("touchcancel", lift);
      node.removeEventListener("gesturestart", stopPageZoom);
      end();
    };
  }, []);

  return [ref, active];
}
