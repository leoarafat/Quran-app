import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "হাদিস" };

export default function HadithPage() {
  return (
    <>
      <PageHeader title="হাদিস" />
      <ComingSoon>উৎস ও অনুবাদের অনুমতি যাচাই করে রেফারেন্সসহ হাদিস যোগ হবে।</ComingSoon>
    </>
  );
}
