import type { Metadata } from "next";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { getSurah } from "@/lib/quran/server";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "সেটিংস" };

export default function SettingsPage() {
  return (
    <>
      <ScreenHeader title="সেটিংস" back={{ href: "/more/", label: "আরও পাতায় ফিরে যান" }} />
      <SettingsForm sample={getSurah(1).ayahs[1]} />
    </>
  );
}
