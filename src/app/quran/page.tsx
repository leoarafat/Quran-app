import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "কুরআন" };

export default function QuranPage() {
  return (
    <>
      <PageHeader title="কুরআন" />
      <ComingSoon>সূরা তালিকা ও রিডার পরের ধাপে যাচাই করা উৎস থেকে যোগ হবে।</ComingSoon>
    </>
  );
}
