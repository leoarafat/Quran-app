import { addDays, noon } from "./hijri";
import { dayKey } from "./routine";

/** Days in a row that qualify, ending today. An unfinished today does not break the run yet. */
export function streak(today: Date, qualifies: (day: string) => boolean): number {
  let count = 0;
  const start = qualifies(dayKey(today)) ? 0 : 1;
  for (let i = start; i < 1000 && qualifies(dayKey(addDays(noon(today), -i))); i++) count++;
  return count;
}
