import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PendingNote } from "@/components/PendingNote";
import { DailyRoutine } from "@/components/tools/DailyRoutine";

export const metadata: Metadata = { title: "সারাদিনের আমল" };

export default function DailyAmalPage() {
  return (
    <div className="mx-auto max-w-md lg:max-w-2xl space-y-4">
      <PageHeader title="সারাদিনের আমল" subtitle="আমার আমলের খাতা" />
      <DailyRoutine />
      <Link href="/amal/" className="flex min-h-12 items-center justify-center rounded-full border border-line-strong bg-surface px-4 text-center font-semibold text-accent">সকাল-সন্ধ্যা, ঘুম ও অন্য দোয়া-যিকির</Link>
      <PendingNote title="যা এখনো নেই" items={["ঘুম থেকে ওঠা থেকে রাত পর্যন্ত সাজানো আমলের রুটিন: কোন আমল কখন ও কতবার, তা আলেম যাচাইয়ের পর যোগ হবে। ততদিন তালিকাটি আপনি নিজে সাজান।"]} />
    </div>
  );
}
