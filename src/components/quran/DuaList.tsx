"use client";

import { useState } from "react";
import { toBnDigits } from "@/lib/bn";
import { QuranPassages, type ShownPassage } from "./QuranPassages";

/** The Quran's supplications, with a shortcut to those that call on "Rabbana". */
export function DuaList({ passages, rabbana, credit }: { passages: ShownPassage[]; /** indexes into passages */ rabbana: number[]; credit: string }) {
  const [only, setOnly] = useState(false);
  const chip = (on: boolean) => `min-h-11 rounded-full border px-4 ${on ? "border-brand bg-brand font-semibold text-on-brand" : "border-line-strong bg-surface"}`;
  return (
    <>
      <div role="group" aria-label="দোয়ার বাছাই" className="mb-3 flex gap-2">
        <button type="button" aria-pressed={!only} className={chip(!only)} onClick={() => setOnly(false)}>সব ({toBnDigits(passages.length)})</button>
        <button type="button" aria-pressed={only} className={chip(only)} onClick={() => setOnly(true)}>“রব্বানা” ({toBnDigits(rabbana.length)})</button>
      </div>
      <QuranPassages passages={only ? rabbana.map((i) => passages[i]) : passages} credit={credit} />
    </>
  );
}
