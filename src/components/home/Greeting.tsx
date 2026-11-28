"use client";

import { useSyncExternalStore } from "react";
import { toBnDigits } from "@/lib/bn";
import { HIJRI_MONTHS, hijriOf, parseAdjust } from "@/lib/tools/hijri";
import { useStored } from "@/lib/useStored";

const never = () => () => {};
const hourStamp = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
};

/** "শনিবার, ২৮ নভেম্বর · ১৭ জুমাদাল আখিরাহ ১৪৪৮"; empty until the page is in the browser. */
export function DateLine({ hijriFirst = false }: { hijriFirst?: boolean }) {
  const stamp = useSyncExternalStore(never, hourStamp, () => "");
  const adjust = useStored("noor.hijri.adjust.v1", parseAdjust);
  if (!stamp) return null;
  const now = new Date();
  const hijri = hijriOf(now, adjust);
  const civil = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", weekday: "long" }).format(now);
  const islamic = `${toBnDigits(hijri.day)} ${HIJRI_MONTHS[hijri.month - 1]} ${toBnDigits(hijri.year)}`;
  return <>{hijriFirst ? `${islamic} · ${civil}` : `${civil} · ${islamic}`}</>;
}
