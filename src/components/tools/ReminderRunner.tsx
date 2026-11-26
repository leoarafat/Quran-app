"use client";

import { useEffect } from "react";
import { clockTime } from "@/lib/prayer";
import { dailyDue, dueReminder, KHATM_REMINDER_KEY, parseDailyReminder, parseReminder, REMINDER_KEY } from "@/lib/tools/reminders";
import { dayKey } from "@/lib/tools/routine";
import { usePrayerPrefs } from "@/lib/usePrayerPrefs";
import { usePlace } from "@/lib/usePlace";
import { useStored } from "@/lib/useStored";

async function show(title: string, body: string, tag: string) {
  const options = { body, tag, icon: "/icons/icon-192.png" };
  // Android browsers only allow notifications through the service worker.
  const registration = await navigator.serviceWorker?.getRegistration();
  if (registration) await registration.showNotification(title, options);
  else new Notification(title, options);
}

/** Shows it once: `tag` is remembered under `key`. */
function once(key: string, tag: string, title: string, body: string) {
  try {
    if (window.localStorage.getItem(key) === tag) return;
    window.localStorage.setItem(key, tag);
  } catch {
    // The notification tag still stops duplicates.
  }
  void show(title, body, tag).catch(() => {});
}

export function ReminderRunner() {
  const { on, before, prayers } = useStored(REMINDER_KEY, parseReminder);
  const khatm = useStored(KHATM_REMINDER_KEY, parseDailyReminder);
  const place = usePlace();
  const prefs = usePrayerPrefs();

  useEffect(() => {
    if (!on && !khatm.on) return;
    const check = () => {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      const now = new Date();
      if (khatm.on && dailyDue(khatm.time, now)) once("noor.khatm.reminder.shown", `khatm-${dayKey(now)}`, "তিলাওয়াতের সময়", "আজকের পৃষ্ঠাগুলো পড়ে নিন।");
      const due = on ? dueReminder(place, prefs, before, now) : null;
      if (!due || !prayers.includes(due.id)) return;
      once("noor.reminder.shown", `${due.id}-${due.at.getTime()}`, before ? `${due.name} আসছে` : `${due.name}ের ওয়াক্ত হয়েছে`, `${place.name}: ${due.name} শুরু ${clockTime(due.at, place.timeZone)}`);
    };
    check();
    const timer = setInterval(check, 20_000);
    return () => clearInterval(timer);
  }, [on, before, prayers, khatm.on, khatm.time, place, prefs]);

  return null;
}
