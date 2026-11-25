import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { TasbihCounter } from "@/components/tools/TasbihCounter";

export const metadata: Metadata = { title: "তাসবিহ" };

export default function TasbihPage() {
  return (
    <div className="mx-auto max-w-md lg:max-w-2xl">
      <PageHeader title="তাসবিহ" subtitle="আপনার গণনা এই ফোনেই থাকে" />
      <TasbihCounter />
    </div>
  );
}
