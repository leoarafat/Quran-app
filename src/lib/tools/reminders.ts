// Prayer reminders shown while the app is open. A closed app cannot be woken without a push server.
import { nextPrayer, type Moment, type Place } from "@/lib/prayer";
import type { PrayerPrefs } from "@/lib/prayerPrefs";

export const REMINDER_KEY = "noor.reminder.v1";
export const BEFORE_CHOICES = [0, 5, 10, 15, 30] as const;
export type Reminder = { on: boolean; before: number };

export function parseReminder(raw: string | null): Reminder {
  try {
    const d = JSON.parse(raw ?? "null");
    return { on: d?.on === true, before: (BEFORE_CHOICES as readonly number[]).includes(d?.before) ? d.before : 10 };
  } catch {
    return { on: false, before: 10 };
  }
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
