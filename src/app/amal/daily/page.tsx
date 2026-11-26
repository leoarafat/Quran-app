import type { Metadata } from "next";
import { PendingNote } from "@/components/PendingNote";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { DailyRoutine } from "@/components/tools/DailyRoutine";
import { LinkList } from "@/components/ui/LinkList";

export const metadata: Metadata = { title: "সারাদিনের আমল" };

export default function DailyAmalPage() {
  return (
    <div className="mx-auto max-w-md md:max-w-2xl">
      <ScreenHeader title="দৈনিক আমল" back={{ href: "/amal/", label: "দোয়া ও আমলে ফিরে যান" }} />
      <div className="space-y-5">
        <DailyRoutine />
        <LinkList items={[{ href: "/amal/", title: "দোয়া ও যিকির", hint: "সালাত, ঘুম ও অন্য দোয়া-যিকির", icon: "note" }]} />
        <PendingNote title="যা এখনো নেই" items={["ঘুম থেকে ওঠা থেকে রাত পর্যন্ত সাজানো আমলের রুটিন: কোন আমল কখন ও কতবার, তা আলেম যাচাইয়ের পর যোগ হবে। ততদিন তালিকাটি আপনি নিজে সাজান।"]} />
      </div>
    </div>
  );
}
