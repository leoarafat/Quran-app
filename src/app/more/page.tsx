import type { Metadata } from "next";
import { MoreMenu } from "@/components/more/MoreMenu";
import { ScreenHeader, SettingsLink } from "@/components/shell/ScreenHeader";

export const metadata: Metadata = { title: "আরও" };

export default function MorePage() {
  return (
    <>
      <ScreenHeader title="আরও"><SettingsLink /></ScreenHeader>
      <MoreMenu />
    </>
  );
}
