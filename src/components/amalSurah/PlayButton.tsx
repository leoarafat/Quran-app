"use client";

import { Icon } from "@/components/ui/Icon";
import { playAyah, toggle, usePlayerValue } from "@/lib/audio/player";
import { AMAL_SURAHS } from "@/lib/amalSurahs";
import { amalPlace, amalPlaylist } from "./shared";

/** Plays from one item of the list; when it ends the next one starts by itself. */
export function PlayFrom({ place, counts, wide = false, label }: { place: number; counts: number[]; /** a full-width button with words */ wide?: boolean; label?: string }) {
  const current = usePlayerValue((s) => amalPlace(s.track));
  const busy = usePlayerValue((s) => s.status === "playing" || s.status === "loading" || s.status === "waiting");
  const here = current === place && !label;
  const sounding = here && busy;
  const start = () => {
    if (here) return toggle();
    const list = amalPlaylist(counts);
    playAyah({ ...list[place], list, place }, AMAL_SURAHS[place].from);
  };
  const name = label ?? `${AMAL_SURAHS[place].title} ${sounding ? "থামান" : "শুনুন"}`;
  return wide ? (
    <button type="button" onClick={start} className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-ac px-4 font-semibold text-on-ac">
      <Icon name={sounding ? "pause" : "play"} className="size-5" /> {label ?? (sounding ? "থামান" : "শুনুন")}
    </button>
  ) : (
    <button type="button" onClick={start} aria-label={name} className={`grid size-12 shrink-0 place-items-center rounded-full ${sounding ? "bg-ac text-on-ac" : "bg-tint text-on-tint"}`}>
      <Icon name={sounding ? "pause" : "play"} className="size-5" />
    </button>
  );
}
