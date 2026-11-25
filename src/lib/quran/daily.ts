/** Short, self-contained ayahs for the home page. Only references are chosen here; the text comes from the data. */
export const DAILY_REFS = [
  [94, 6], [2, 152], [2, 153], [13, 28], [3, 139], [65, 3], [93, 5], [40, 60], [14, 7], [2, 186], [39, 53], [94, 5], [20, 114], [29, 69],
] as const;

/** Changes at local midnight. */
export function dailyIndex(date: Date, length: number): number {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return day % length;
}
