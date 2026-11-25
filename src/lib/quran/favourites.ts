// The visitor's favourite surahs.
export const FAVOURITES_KEY = "noor.favsurahs.v1";

export function parseFavourites(raw: string | null): number[] {
  try {
    const list = JSON.parse(raw ?? "[]");
    return Array.isArray(list) ? [...new Set(list.filter((n): n is number => Number.isInteger(n) && n >= 1 && n <= 114))].sort((a, b) => a - b) : [];
  } catch {
    return [];
  }
}

export const toggleFavourite = (list: number[], surah: number) => (list.includes(surah) ? list.filter((n) => n !== surah) : [...list, surah].sort((a, b) => a - b));
