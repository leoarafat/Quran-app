"use client";

import { useSyncExternalStore } from "react";
import { toBnDigits } from "@/lib/bn";
import { greetingFor } from "@/lib/greeting";
import { HIJRI_MONTHS, hijriOf, parseAdjust } from "@/lib/tools/hijri";
import { useStored } from "@/lib/useStored";

const never = () => () => {};
const hourStamp = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
};

export function Greeting({ basmalah }: { /** from the Quran data, never typed */ basmalah: string }) {
  const stamp = useSyncExternalStore(never, hourStamp, () => "");
  const adjust = useStored("noor.hijri.adjust.v1", parseAdjust);
  let line = "";
  if (stamp) {
    const now = new Date();
    const hijri = hijriOf(now, adjust);
    const civil = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", weekday: "long" }).format(now);
    line = `${greetingFor(now.getHours())} · ${toBnDigits(hijri.day)} ${HIJRI_MONTHS[hijri.month - 1]} ${toBnDigits(hijri.year)} · ${civil}`;
  }
  return (
    <header className="md:flex md:items-end md:justify-between md:gap-6">
      <div className="min-w-0">
        <h1 className="font-display text-[1.75rem] font-semibold leading-normal md:text-[2.125rem]">আসসালামু আলাইকুম</h1>
        <p className="min-h-[1.65em] text-[0.9375rem] text-ink2">{line}</p>
      </div>
      <p lang="ar" dir="rtl" className="text-right font-arabic text-[1.625rem] leading-[2.1] text-gt md:text-[1.875rem]">{basmalah}</p>
    </header>
  );
}
