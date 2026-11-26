// Prayer reminders shown while the app is open. A closed app cannot be woken without a push server.
import { nextPrayer, PRAYERS, type Moment, type Place, type PrayerId } from "@/lib/prayer";
import type { PrayerPrefs } from "@/lib/prayerPrefs";

export const REMINDER_KEY = "noor.reminder.v1";
export const BEFORE_CHOICES = [0, 5, 10, 15, 30] as const;
/** `prayers` was added later: a reminder saved before it covers all five. */
export type Reminder = { on: boolean; before: number; prayers: PrayerId[] };
const ALL = PRAYERS.map(([id]) => id);

export function parseReminder(raw: string | null): Reminder {
  try {
    const d = JSON.parse(raw ?? "null");
    const prayers = Array.isArray(d?.prayers) ? ALL.filter((id) => d.prayers.includes(id)) : ALL;
    return { on: d?.on === true && prayers.length > 0, before: (BEFORE_CHOICES as readonly number[]).includes(d?.before) ? d.before : 10, prayers };
  } catch {
    return { on: false, before: 10, prayers: ALL };
  }
}

/** Whether this prayer's switch shows as on. */
export const reminds = (r: Reminder, id: PrayerId) => r.on && r.prayers.includes(id);

/** One prayer's switch. The first switch on turns reminders on for that prayer alone. */
export function setPrayerReminder(r: Reminder, id: PrayerId, on: boolean): Reminder {
  const chosen = r.on ? r.prayers : [];
  const prayers = ALL.filter((p) => (p === id ? on : chosen.includes(p)));
  return { ...r, on: prayers.length > 0, prayers: prayers.length > 0 ? prayers : ALL };
}

/** A reminder missed by more than this (phone asleep) is dropped rather than shown late. */
const LATE_LIMIT = 90_000;

/** The prayer whose reminder falls due at `now`, if any. */
export function dueReminder(place: Place, prefs: PrayerPrefs, before: number, now: Date): Moment | null {
  const lead = before * 60_000;
  // Looking from just before the window lets a reminder at the prayer time itself be found.
  const { next } = nextPrayer(place, new Date(now.getTime() + lead - LATE_LIMIT), prefs);
  const late = now.getTime() - (next.at.getTime() - lead);
  return late >= 0 && late < LATE_LIMIT ? next : null;
}

// A daily reminder at a time the visitor picks, for the reading of the Quran.
export const KHATM_REMINDER_KEY = "noor.khatm.reminder.v1";
export type DailyReminder = { on: boolean; /** "HH:MM", the phone's own clock */ time: string };

export function parseDailyReminder(raw: string | null): DailyReminder {
  try {
    const d = JSON.parse(raw ?? "null");
    return { on: d?.on === true, time: typeof d?.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(d.time) ? d.time : "06:00" };
  } catch {
    return { on: false, time: "06:00" };
  }
}

export function dailyDue(time: string, now: Date): boolean {
  const [h, m] = time.split(":").map(Number);
  const late = now.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m).getTime();
  return late >= 0 && late < LATE_LIMIT;
}
