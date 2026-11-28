"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { AyahOrnament } from "@/components/ui/AyahOrnament";
import { usePlayerValue } from "@/lib/audio/player";
import { AMAL_SURAHS, amalSurahPath } from "@/lib/amalSurahs";
import { toBnDigits } from "@/lib/bn";
import { amalPlace } from "./shared";

export type Line = { a: number; ar: string; tr: string; bn: string };

/** The passage in full. The ayah being recited is lit, and the page follows the list to its next item. */
export function Reading({ place, lines }: { place: number; lines: Line[] }) {
  const router = useRouter();
  const current = usePlayerValue((s) => amalPlace(s.track));
  const ayah = usePlayerValue((s) => (amalPlace(s.track) === place && s.status !== "idle" ? s.position.ayah : 0));
  const was = useRef(current);
  const box = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const before = was.current;
    was.current = current;
    if (before === place && current === place + 1) router.push(amalSurahPath(AMAL_SURAHS[current].slug));
  }, [current, place, router]);

  useEffect(() => {
    if (!ayah) return;
    const row = box.current?.querySelector<HTMLElement>(`[data-ayah="${ayah}"]`);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row?.scrollIntoView({ block: "center", behavior: still ? "auto" : "smooth" });
  }, [ayah]);

  return (
    <ol ref={box} className="divide-y divide-ln rounded-md border border-ln bg-sf">
      {lines.map((line) => (
        <li key={line.a} data-ayah={line.a} aria-current={ayah === line.a ? "true" : undefined} className={`px-4 py-4 ${ayah === line.a ? "bg-gs" : ""}`}>
          <AyahOrnament label={toBnDigits(line.a)} />
          <p lang="ar" dir="rtl" className="mt-1 text-right font-arabic leading-[2.4]" style={{ fontSize: "calc(1.875rem * var(--ar-scale))" }}>{line.ar}</p>
          <p className="reading mt-2 text-[0.9375rem] leading-relaxed text-gt">{line.tr}</p>
          <p className="reading mt-1.5 leading-relaxed">{line.bn}</p>
        </li>
      ))}
    </ol>
  );
}
