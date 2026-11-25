import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { HijriCalendar } from "@/components/tools/HijriCalendar";

export const metadata: Metadata = { title: "হিজরি ক্যালেন্ডার" };

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="হিজরি ক্যালেন্ডার" subtitle="তারিখ ও বিশেষ দিন" />
      <HijriCalendar />
    </div>
  );
}
