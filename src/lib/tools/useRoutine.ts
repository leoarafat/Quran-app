"use client";

import { useStored, writeStored } from "@/lib/useStored";
import { EMPTY_ROUTINE, readRoutine, type Routine } from "./routine";

const KEY = "noor.routine.v1";
const RESCUE_KEY = "noor.routine.unreadable";
const parse = (raw: string | null): { routine: Routine; unreadable: string | null } => {
  const routine = raw === null ? EMPTY_ROUTINE : readRoutine(raw);
  return routine ? { routine, unreadable: null } : { routine: EMPTY_ROUTINE, unreadable: raw };
};

/** The visitor's checklist. Every screen that ticks it must save through here. */
export function useRoutine() {
  const { routine, unreadable } = useStored(KEY, parse);
  const save = (next: Routine) => {
    // Data we could not read is set aside first, so saving can never destroy it.
    if (unreadable !== null) writeStored(RESCUE_KEY, unreadable);
    writeStored(KEY, JSON.stringify(next));
  };
  return { routine, unreadable, save };
}
