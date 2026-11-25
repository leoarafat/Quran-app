// The curve on the next-prayer card, from the previous prayer to the next one.
const START = { x: 8, y: 66 };
const CONTROL = { x: 163, y: -22 };
const END = { x: 318, y: 66 };

const round = (n: number) => Math.round(n * 100) / 100;
const mix = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({ x: round(a.x + (b.x - a.x) * t), y: round(a.y + (b.y - a.y) * t) });

/** The whole curve, the part already passed, and the point reached, for a progress of 0..1. */
export function dayArc(progress: number): { whole: string; done: string; x: number; y: number } {
  const t = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  const first = mix(START, CONTROL, t);
  const point = mix(first, mix(CONTROL, END, t), t);
  const path = (c: { x: number; y: number }, e: { x: number; y: number }) => `M${START.x} ${START.y}Q${c.x} ${c.y} ${e.x} ${e.y}`;
  return { whole: path(CONTROL, END), done: path(first, point), ...point };
}
