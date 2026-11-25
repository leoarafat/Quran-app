import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "সার্চ" };

export default function SearchPage() {
  return (
    <>
      <PageHeader title="সার্চ" />
      <ComingSoon>কন্টেন্ট যোগ হওয়ার পর এক জায়গা থেকেই সবকিছু খোঁজা যাবে।</ComingSoon>
    </>
  );
}
