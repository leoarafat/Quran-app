import { AMAL_SURAHS } from "@/lib/amalSurahs";
import type { Track } from "@/lib/audio/sequence";

/** The whole list as one playlist. A whole surah has no `first`; a piece of one does. */
export function amalPlaylist(counts: number[]): Track[] {
  return AMAL_SURAHS.map((x) => ({
    surah: x.s,
    surahName: x.title,
    total: x.to,
    ...(x.from === 1 && x.to === counts[x.s - 1] ? {} : { first: x.from }),
  }));
}

/** Which list item a playing track is, or -1 when something else is playing. */
export const amalPlace = (track: Track | null) => (track?.list && track.list.length === AMAL_SURAHS.length && track.list[0].surahName === AMAL_SURAHS[0].title ? track.place ?? 0 : -1);
