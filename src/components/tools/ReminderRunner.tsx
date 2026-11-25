"use client";

import { useEffect } from "react";
import { clockTime } from "@/lib/prayer";
import { dueReminder, parseReminder, REMINDER_KEY } from "@/lib/tools/reminders";
import { usePrayerPrefs } from "@/lib/usePrayerPrefs";
import { usePlace } from "@/lib/usePlace";
import { useStored } from "@/lib/useStored";

const SHOWN_KEY = "noor.reminder.shown";

async function show(title: string, body: string, tag: string) {
  const options = { body, tag, icon: "/icons/icon-192.png" };
  // Android browsers only allow notifications through the service worker.
  const registration = await navigator.serviceWorker?.getRegistration();
  if (registration) await registration.showNotification(title, options);
  else new Notification(title, options);
}

export function ReminderRunner() {
  const { on, before } = useStored(REMINDER_KEY, parseReminder);
  const place = usePlace();
  const prefs = usePrayerPrefs();

  useEffect(() => {
    if (!on) return;
    const check = () => {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      const due = dueReminder(place, prefs, before, new Date());
      if (!due) return;
      const tag = `${due.id}-${due.at.getTime()}`;
      try {
        if (window.localStorage.getItem(SHOWN_KEY) === tag) return;
        window.localStorage.setItem(SHOWN_KEY, tag);
      } catch {
        // The notification tag still stops duplicates.
      }
      void show(before ? `${due.name} আসছে` : `${due.name}ের ওয়াক্ত হয়েছে`, `${place.name}: ${due.name} শুরু ${clockTime(due.at, place.timeZone)}`, tag).catch(() => {});
    };
    check();
    const timer = setInterval(check, 20_000);
    return () => clearInterval(timer);
  }, [on, before, place, prefs]);

  return null;
}
