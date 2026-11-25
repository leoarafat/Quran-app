// How prayer times are calculated. The defaults are what the app has always used.
export const METHODS = [
  ["karachi", "করাচি (বাংলাদেশে প্রচলিত)"],
  ["mwl", "মুসলিম ওয়ার্ল্ড লীগ"],
  ["egyptian", "মিশরীয় জরিপ কর্তৃপক্ষ"],
  ["ummalqura", "উম্মুল কুরা (মক্কা)"],
  ["isna", "উত্তর আমেরিকা (ISNA)"],
] as const;
export type MethodId = (typeof METHODS)[number][0];

export const ADJUSTABLE = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;
export type Adjustable = (typeof ADJUSTABLE)[number];
export const ADJUST_LIMIT = 30;

export type PrayerPrefs = { method: MethodId; asr: "hanafi" | "shafi"; adjust: Record<Adjustable, number> };

const noAdjust = () => Object.fromEntries(ADJUSTABLE.map((id) => [id, 0])) as PrayerPrefs["adjust"];
export const DEFAULT_PRAYER_PREFS: PrayerPrefs = { method: "karachi", asr: "hanafi", adjust: noAdjust() };
export const PRAYER_PREFS_KEY = "noor.prayer.v1";

export function parsePrayerPrefs(raw: string | null): PrayerPrefs {
  try {
    const d = JSON.parse(raw ?? "null");
    if (!d || typeof d !== "object") return DEFAULT_PRAYER_PREFS;
    const adjust = noAdjust();
    for (const id of ADJUSTABLE) {
      const n = d.adjust?.[id];
      if (Number.isInteger(n)) adjust[id] = Math.min(ADJUST_LIMIT, Math.max(-ADJUST_LIMIT, n));
    }
    return {
      method: METHODS.some(([id]) => id === d.method) ? d.method : DEFAULT_PRAYER_PREFS.method,
      asr: d.asr === "shafi" ? "shafi" : "hanafi",
      adjust,
    };
  } catch {
    return DEFAULT_PRAYER_PREFS;
  }
}
