import Link from "next/link";
import { Settings as SettingsIcon } from "lucide-react";
import { FeatureGrid } from "@/components/FeatureGrid";
import { TodayDate } from "@/components/TodayDate";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3 rounded-3xl bg-hero p-5 text-on-hero">
        <div>
          <h1 className="text-2xl font-bold leading-snug">আসসালামু আলাইকুম</h1>
          <TodayDate />
        </div>
        <Link href="/settings/" aria-label="সেটিংস" className="grid size-11 shrink-0 place-items-center rounded-full border border-on-hero/30">
          <SettingsIcon aria-hidden className="size-6" />
        </Link>
      </header>
      <FeatureGrid />
    </div>
  );
}
