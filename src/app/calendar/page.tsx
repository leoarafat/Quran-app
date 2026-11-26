import type { Metadata } from "next";
import { HijriCalendar } from "@/components/tools/HijriCalendar";

export const metadata: Metadata = { title: "হিজরি ক্যালেন্ডার" };

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-5xl">
      <HijriCalendar />
    </div>
  );
}
