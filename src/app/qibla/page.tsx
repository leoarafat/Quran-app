import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { QiblaCompass } from "@/components/tools/QiblaCompass";

export const metadata: Metadata = { title: "কিবলা" };

export default function QiblaPage() {
  return (
    <div className="mx-auto max-w-md lg:max-w-2xl">
      <PageHeader title="কিবলা" subtitle="কাবার দিক নির্ণয়" />
      <QiblaCompass />
    </div>
  );
}
