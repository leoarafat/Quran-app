// Which lessons the visitor has marked as learned. Their data; never lose it.
export const LEARNED_KEY = "noor.learned.v1";

export function parseLearned(raw: string | null): string[] {
  try {
    const list = JSON.parse(raw ?? "[]");
    return Array.isArray(list) ? [...new Set(list.filter((x): x is string => typeof x === "string" && x.startsWith("/")))] : [];
  } catch {
    return [];
  }
}

export const toggleLearned = (list: string[], href: string) => (list.includes(href) ? list.filter((x) => x !== href) : [...list, href]);
