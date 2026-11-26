import type { Metadata } from "next";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { QiblaCompass } from "@/components/tools/QiblaCompass";

export const metadata: Metadata = { title: "কিবলা" };

export default function QiblaPage() {
  return (
    <div className="mx-auto max-w-md md:max-w-lg">
      <ScreenHeader title="কিবলা" back={{ href: "/more/", label: "আরও পাতায় ফিরে যান" }} />
      <QiblaCompass />
    </div>
  );
}
