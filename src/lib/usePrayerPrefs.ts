"use client";

import { parsePrayerPrefs, PRAYER_PREFS_KEY } from "./prayerPrefs";
import { useStored } from "./useStored";

export const usePrayerPrefs = () => useStored(PRAYER_PREFS_KEY, parsePrayerPrefs);
