import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Settings } from "lucide-react";
import { FeatureGrid } from "@/components/FeatureGrid";
import { PageHeader } from "@/components/PageHeader";
import { WelcomeLink } from "@/components/WelcomeLink";

export const metadata: Metadata = { title: "আরও" };

export default function MorePage() {
  return (
    <>
      <PageHeader title="আরও" />
      <WelcomeLink className="mb-3 flex min-h-14 items-center gap-3 rounded-[1.375rem] border border-line bg-surface px-4" />
      <Link href="/settings/" className="mb-6 flex min-h-14 items-center gap-3 rounded-[1.375rem] border border-line bg-surface px-4">
        <Settings aria-hidden className="size-6 text-accent" />
        <span className="flex-1 font-semibold">সেটিংস</span>
        <ChevronRight aria-hidden className="size-5 text-muted" />
      </Link>
      <FeatureGrid />
      <Link href="/about/" className="mt-6 flex min-h-12 items-center justify-center font-semibold text-brand underline">উৎস ও শর্ত</Link>
    </>
  );
}
