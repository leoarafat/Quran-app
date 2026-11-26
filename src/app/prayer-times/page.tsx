import type { Metadata } from "next";
import { PrayerCentre } from "@/components/tools/PrayerCentre";

export const metadata: Metadata = { title: "নামাজের সময়সূচি" };

export default function PrayerTimesPage() {
  return (
    <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-none">
      <PrayerCentre />
    </div>
  );
}
