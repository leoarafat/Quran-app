import type { Metadata } from "next";
import { TasbihCounter } from "@/components/tools/TasbihCounter";

export const metadata: Metadata = { title: "তাসবিহ" };

export default function TasbihPage() {
  return (
    <div className="mx-auto max-w-md md:max-w-lg">
      <TasbihCounter />
    </div>
  );
}
