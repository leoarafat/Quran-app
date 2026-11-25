"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

const REVEAL = 88;

/**
 * Swiping a card to the left uncovers a delete button. It is only a shortcut: the same button
 * is in the card's menu, so nothing depends on swiping.
 */
export function SwipeRow({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const start = useRef<{ x: number; y: number; sideways: boolean | null } | null>(null);
  /** a swipe must not also count as a tap on the link under the finger */
  const swiped = useRef(false);
  const rest = open ? -REVEAL : 0;
  const offset = drag ?? rest;

  const end = () => {
    if (drag !== null) setOpen(drag < -REVEAL / 2);
    setDrag(null);
    start.current = null;
  };

  return (
    <div className="relative overflow-hidden rounded-md">
      {offset < 0 && (
        <button type="button" tabIndex={open ? 0 : -1} aria-hidden={!open} aria-label="মুছুন" onClick={onDelete} className="absolute inset-y-0 right-0 grid w-[6rem] place-items-center bg-[#a8473b] pl-2 text-white">
          <Icon name="trash" />
        </button>
      )}
      <div
        className="relative touch-pan-y"
        style={{ transform: offset ? `translateX(${offset}px)` : undefined, transition: drag === null ? "transform 0.18s ease-out" : undefined }}
        onPointerDown={(e) => { if (e.pointerType !== "mouse") { start.current = { x: e.clientX, y: e.clientY, sideways: null }; swiped.current = false; } }}
        onPointerMove={(e) => {
          const from = start.current;
          if (!from) return;
          const dx = e.clientX - from.x;
          if (from.sideways === null) {
            if (Math.abs(dx) < 10 && Math.abs(e.clientY - from.y) < 10) return;
            from.sideways = Math.abs(dx) > Math.abs(e.clientY - from.y);
            if (from.sideways) { swiped.current = true; e.currentTarget.setPointerCapture(e.pointerId); }
          }
          if (from.sideways) setDrag(Math.min(0, Math.max(-REVEAL, rest + dx)));
        }}
        onPointerUp={end}
        onPointerCancel={end}
        onClickCapture={(e) => { if (swiped.current) { e.preventDefault(); e.stopPropagation(); swiped.current = false; } }}
      >
        {children}
      </div>
    </div>
  );
}
