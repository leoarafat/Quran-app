import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PrayerCentre } from "@/components/tools/PrayerCentre";

export const metadata: Metadata = { title: "নামাজের সময়সূচি" };

export default function PrayerTimesPage() {
  return (
    <div className="mx-auto max-w-md lg:max-w-5xl space-y-4">
      <PageHeader title="নামাজের সময়সূচি" subtitle="মাসিক সূচি, হিসাবের নিয়ম ও রিমাইন্ডার" />
      <PrayerCentre />
    </div>
  );
}
