import { toBnDigits } from "@/lib/bn";
import type { Ref } from "@/lib/tools/planner";

export const solid = "flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-ac px-4 font-semibold text-on-ac disabled:opacity-40";
export const outline = "flex min-h-13 w-full items-center justify-center gap-2 rounded-full border border-ac px-4 font-semibold text-ac";
export const refText = (names: string[], r: Ref) => `${names[r.s - 1]} ${toBnDigits(r.s)}:${toBnDigits(r.a)}`;

const short = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "short", timeZone: "UTC" });
export const shortDate = (day: string) => short.format(new Date(`${day}T00:00:00Z`));
