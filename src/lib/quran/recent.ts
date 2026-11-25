// Surahs opened lately, newest first.
export const RECENT_KEY = "noor.recent.v1";
const LIMIT = 6;

export function parseRecent(raw: string | null): number[] {
  try {
    const list = JSON.parse(raw ?? "[]");
    return Array.isArray(list) ? [...new Set(list.filter((n): n is number => Number.isInteger(n) && n >= 1 && n <= 114))].slice(0, LIMIT) : [];
  } catch {
    return [];
  }
}

export const addRecent = (list: number[], surah: number) => [surah, ...list.filter((n) => n !== surah)].slice(0, LIMIT);

export function remember(surah: number) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(addRecent(parseRecent(window.localStorage.getItem(RECENT_KEY)), surah)));
  } catch {
    // Not essential.
  }
}
