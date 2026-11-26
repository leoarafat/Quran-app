"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { toBnDigits } from "@/lib/bn";
import { QuranPassages, type ShownPassage } from "./QuranPassages";

/** The Quran's supplications, with a shortcut to those that call on "Rabbana". */
export function DuaList({ passages, rabbana, credit }: { passages: ShownPassage[]; /** indexes into passages */ rabbana: number[]; credit: string }) {
  const [only, setOnly] = useState(false);
  return (
    <>
      <div role="group" aria-label="দোয়ার বাছাই" className="mb-3 flex gap-2">
        <Chip aria-pressed={!only} selected={!only} onClick={() => setOnly(false)}>সব ({toBnDigits(passages.length)})</Chip>
        <Chip aria-pressed={only} selected={only} onClick={() => setOnly(true)}>“রব্বানা” ({toBnDigits(rabbana.length)})</Chip>
      </div>
      <QuranPassages passages={only ? rabbana.map((i) => passages[i]) : passages} credit={credit} />
    </>
  );
}
