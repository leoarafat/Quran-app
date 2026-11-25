"use client";

import { toBnDigits } from "@/lib/bn";
import { usePinchText } from "@/lib/reader/usePinchText";

const percent = (scale: number) => `${toBnDigits(Math.round(scale * 100))}%`;

/** Wraps Quran text so that two fingers resize it. */
export function PinchArea({ children }: { children: React.ReactNode }) {
  const [ref, sizes] = usePinchText();
  return (
    <div ref={ref} className="[touch-action:pan-x_pan-y]">
      {children}
      {sizes && (
        <p aria-hidden className="pointer-events-none fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-line-strong bg-raised px-5 py-2.5 font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
          আরবি {percent(sizes.arScale)} · বাংলা {percent(sizes.bnScale)}
        </p>
      )}
    </div>
  );
}
