"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { LETTERS } from "@/lib/arabic/letters";
import { toBnDigits } from "@/lib/bn";

/** Trace a faded letter with a finger, pen or mouse. Nothing is saved or scored. */
export function WritingBoard() {
  const [at, setAt] = useState(0);
  const [guide, setGuide] = useState(true);
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);

  const clear = () => {
    const c = canvas.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
  };

  // The drawing buffer follows the shown size; resizing (or turning the phone) starts a clean board.
  useEffect(() => {
    const c = canvas.current!;
    const watch = new ResizeObserver(() => {
      const scale = window.devicePixelRatio || 1;
      c.width = Math.round(c.clientWidth * scale);
      c.height = Math.round(c.clientHeight * scale);
    });
    watch.observe(c);
    return () => watch.disconnect();
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = e.currentTarget;
    const box = c.getBoundingClientRect();
    return { x: (e.clientX - box.left) * (c.width / box.width), y: (e.clientY - box.top) * (c.height / box.height) };
  };
  const line = (c: HTMLCanvasElement, from: { x: number; y: number }, to: { x: number; y: number }) => {
    const pen = c.getContext("2d")!;
    pen.strokeStyle = getComputedStyle(c).color;
    pen.lineWidth = c.width / 32;
    pen.lineCap = "round";
    pen.beginPath();
    pen.moveTo(from.x, from.y);
    pen.lineTo(to.x, to.y);
    pen.stroke();
  };
  const go = (next: number) => { setAt(next); clear(); };
  const button = "flex min-h-12 flex-1 items-center justify-center gap-1 rounded-full border border-ln2 bg-sf px-2 font-semibold disabled:opacity-35";

  return (
    <section className="mx-auto max-w-lg space-y-3">
      <p className="text-center text-sm leading-relaxed text-ink2">হালকা হরফের ওপর আঙুল বা মাউস দিয়ে লিখুন। লেখা সেভ বা যাচাই হয় না।</p>
      <h2 className="text-center font-display text-xl font-semibold">{LETTERS[at].name} <span className="text-sm text-ink2">{toBnDigits(at + 1)}/{toBnDigits(LETTERS.length)}</span></h2>
      <div className="relative aspect-square overflow-hidden rounded-md border border-ln2 bg-sf">
        {guide && <span aria-hidden lang="ar" className="pointer-events-none absolute inset-0 flex select-none items-center justify-center pb-16 font-arabic text-[11rem] leading-none text-ink opacity-15 min-[24rem]:text-[13rem]">{LETTERS[at].ch}</span>}
        <canvas
          ref={canvas}
          role="img"
          aria-label={`${LETTERS[at].name} লেখার বোর্ড`}
          className="absolute inset-0 size-full cursor-crosshair touch-none text-ac"
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); last.current = point(e); line(e.currentTarget, last.current, last.current); }}
          onPointerMove={(e) => { if (!last.current) return; const next = point(e); line(e.currentTarget, last.current, next); last.current = next; }}
          onPointerUp={() => { last.current = null; }}
          onPointerCancel={() => { last.current = null; }}
        />
      </div>
      <div className="flex gap-2">
        <button type="button" className={button} onClick={clear}>মুছুন</button>
        <button type="button" className={button} aria-pressed={guide} onClick={() => setGuide(!guide)}>{guide ? "হরফ লুকান" : "হরফ দেখান"}</button>
      </div>
      <div className="flex gap-2">
        <button type="button" className={button} disabled={at === 0} onClick={() => go(at - 1)}><Icon name="back" className="size-5" /> আগের হরফ</button>
        <button type="button" className={button} disabled={at === LETTERS.length - 1} onClick={() => go(at + 1)}>পরের হরফ <Icon name="chev" className="size-5" /></button>
      </div>
    </section>
  );
}
