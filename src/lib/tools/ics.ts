// A calendar file the phone's own calendar can import, which can then remind even when this app is closed.
import { addDays } from "./hijri";
import { dayKey } from "./routine";

export type DayEvent = { date: Date; name: string };

const compact = (d: Date) => dayKey(d).replace(/-/g, "");
const escape = (text: string) => text.replace(/\\/g, "\\\\").replace(/[;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n");
export const NOTE = "আনুমানিক তারিখ। চাঁদ দেখা অনুযায়ী বদলাতে পারে।";

/** All-day events, each with a reminder at 6 pm the evening before. */
export function toIcs(events: DayEvent[], made: Date): string {
  const stamp = made.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//noor-quran//BN", "CALSCALE:GREGORIAN"];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT", `UID:${compact(e.date)}-noor-quran`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(e.date)}`, `DTEND;VALUE=DATE:${compact(addDays(e.date, 1))}`,
      `SUMMARY:${escape(e.name)}`, `DESCRIPTION:${escape(NOTE)}`,
      "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escape(e.name)}`, "TRIGGER:-PT6H", "END:VALARM",
      "END:VEVENT",
    );
  }
  return [...lines, "END:VCALENDAR"].join("\r\n") + "\r\n";
}
