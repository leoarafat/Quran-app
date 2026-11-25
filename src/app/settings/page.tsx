import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "সেটিংস" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="সেটিংস" subtitle="আপনার পছন্দ এই ফোনেই সংরক্ষিত থাকে" />
      <SettingsForm />
    </>
  );
}
