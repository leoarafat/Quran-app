"use client";

import Link from "next/link";
import { toBnDigits } from "@/lib/bn";
import { parseAdjust, upcomingSpecialDays } from "@/lib/tools/hijri";
import { useNow } from "@/lib/useNow";
import { useInBrowser, useStored } from "@/lib/useStored";

/** The next fixed day of the Hijri calendar, from the same list as the calendar page. */
export function Upcoming({ tone = "soft" }: { /** the green card of the phone home page, or the cream one of the side bar */ tone?: "soft" | "deep" }) {
  const ready = useInBrowser();
  const now = useNow();
  const adjust = useStored("noor.hijri.adjust.v1", parseAdjust);
  if (!ready || now === null) return null;
  const [next] = upcomingSpecialDays(new Date(now), adjust, 1);
  if (!next) return null;
  const date = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long" }).format(next.date);
  return (
    <Link href="/calendar/" className={`flex shrink-0 flex-col gap-0.5 p-4 ${tone === "deep" ? "on-deep rounded-[1.25rem] bg-hero p-4.5 text-on-hero" : "rounded-2xl bg-gold-soft"}`}>
      <span className={`text-xs font-semibold ${tone === "deep" ? "text-hero-accent" : "text-gt"}`}>আসন্ন</span>
      <span className="font-display text-lg font-semibold">{next.name}</span>
      <span className={`text-[0.8125rem] ${tone === "deep" ? "text-hero-muted" : "text-on-gold-soft"}`}>{next.inDays === 0 ? "আজ" : `${toBnDigits(next.inDays)} দিন পর`} · {date} (চাঁদ দেখা সাপেক্ষে)</span>
    </Link>
  );
}
