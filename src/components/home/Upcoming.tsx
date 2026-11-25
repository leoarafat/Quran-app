"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { toBnDigits } from "@/lib/bn";
import { parseAdjust, upcomingSpecialDays } from "@/lib/tools/hijri";
import { useNow } from "@/lib/useNow";
import { useInBrowser, useStored } from "@/lib/useStored";

/** The next fixed day of the Hijri calendar, from the same list as the calendar page. */
export function Upcoming() {
  const ready = useInBrowser();
  const now = useNow();
  const adjust = useStored("noor.hijri.adjust.v1", parseAdjust);
  if (!ready || now === null) return null;
  const [next] = upcomingSpecialDays(new Date(now), adjust, 1);
  if (!next) return null;
  const date = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long" }).format(next.date);
  return (
    <Link href="/calendar/" className="block rounded-md border border-ln bg-sf p-4 shadow-card hover:border-ac">
      <h2 className="font-display text-base font-semibold">আসন্ন</h2>
      <span className="mt-2 flex gap-2.5">
        <Icon name="moon" className="size-[1.375rem] text-gd" />
        <span>
          <b className="block text-[0.9375rem]">{next.name}</b>
          <span className="block text-[0.8125rem] text-ink2">{next.inDays === 0 ? "আজ" : `${toBnDigits(next.inDays)} দিন পর`} · {date} (চাঁদ দেখা সাপেক্ষে)</span>
        </span>
      </span>
    </Link>
  );
}
