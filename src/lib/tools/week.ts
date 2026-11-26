import { addDays, noon } from "./hijri";
import { dayKey } from "./routine";

/** The seven days of the week `today` falls in, Saturday to Friday, as printed in Bangladesh. */
export function weekFromSaturday(today: Date): string[] {
  const back = (today.getDay() + 1) % 7;
  return Array.from({ length: 7 }, (_, i) => dayKey(addDays(noon(today), i - back)));
}
