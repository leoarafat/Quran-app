// One file holding everything the visitor has made or chosen in the app. Their data; never lose it.
import { merge, readLibrary } from "@/lib/bookmarks/model";

export const BOOKMARKS_KEY = "noor.bookmarks.v1";

export const BACKUP_KEYS: Record<string, string> = {
  [BOOKMARKS_KEY]: "বুকমার্ক ও নোট",
  "noor.lastRead.v1": "শেষ পড়ার জায়গা",
  "noor.recent.v1": "সম্প্রতি পড়া সূরা",
  "noor.khatm.v1": "খতম ও দৈনিক লক্ষ্য",
  "noor.plans.v1": "কুরআন প্ল্যানার",
  "noor.routine.v1": "আমলের খাতা",
  "noor.tasbih.v1": "তাসবিহ",
  "noor.quiz.v1": "কুইজের ফল",
  "noor.learned.v1": "শেখা পাঠের চিহ্ন",
  "noor.fasts.v1": "রোজার খাতা",
  "noor.favsurahs.v1": "প্রিয় সূরা",
  "noor.searches.v1": "সার্চ ইতিহাস",
  "noor.settings.v1": "থিম ও লেখার সাইজ",
  "noor.reader.v1": "পড়ার ধরন",
  "noor.audio.v1": "ক্বারী ও অডিও অপশন",
  "noor.place.v1": "শহর বা অবস্থান",
  "noor.prayer.v1": "নামাজের হিসাবের নিয়ম",
  "noor.reminder.v1": "রিমাইন্ডার",
  "noor.khatm.reminder.v1": "খতমের রিমাইন্ডার",
  "noor.hijri.adjust.v1": "হিজরি তারিখ সমন্বয়",
};

/** Copies kept aside or bookkeeping: not worth backing up, but removed by "delete everything". */
export const OTHER_KEYS = ["noor.bookmarks.unreadable", "noor.khatm.unreadable", "noor.plans.unreadable", "noor.fasts.unreadable", "noor.routine.unreadable", "noor.reminder.shown", "noor.onboarded.v1", "noor.khatm.reminder.shown", "noor.welcome.v1"];

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type Backup = { app: "noor-quran"; kind: "full"; version: 1; made: string; data: Record<string, string> };

export function makeBackup(store: Store, now: Date): Backup {
  const data: Record<string, string> = {};
  for (const key of Object.keys(BACKUP_KEYS)) {
    const value = store.getItem(key);
    if (value !== null) data[key] = value;
  }
  return { app: "noor-quran", kind: "full", version: 1, made: now.toISOString(), data };
}

/** Null if the file is not a full backup of this app. Unknown keys are ignored. */
export function readBackup(text: string): Backup | null {
  try {
    const d = JSON.parse(text);
    if (d?.app !== "noor-quran" || d.kind !== "full" || d.version !== 1 || typeof d.data !== "object" || !d.data) return null;
    const data: Record<string, string> = {};
    for (const key of Object.keys(BACKUP_KEYS)) if (typeof d.data[key] === "string") data[key] = d.data[key];
    return Object.keys(data).length ? { app: "noor-quran", kind: "full", version: 1, made: String(d.made ?? ""), data } : null;
  } catch {
    return null;
  }
}

const parsed = (raw: string | null) => {
  try {
    return readLibrary(JSON.parse(raw ?? "null"));
  } catch {
    return null;
  }
};

/** Bookmarks are merged, so none are lost. Everything else in the file replaces what is here. */
export function restoreBackup(store: Store, backup: Backup): void {
  for (const [key, value] of Object.entries(backup.data)) {
    if (key !== BOOKMARKS_KEY) {
      store.setItem(key, value);
      continue;
    }
    const incoming = parsed(value);
    if (!incoming) continue;
    const here = store.getItem(key);
    const current = parsed(here);
    // Unreadable bookmarks already on the device are set aside, not written over.
    if (here !== null && !current) store.setItem("noor.bookmarks.unreadable", here);
    const { folders, items, hadiths, version } = current ? merge(current, incoming).library : incoming;
    store.setItem(key, JSON.stringify({ version, folders, items, hadiths }));
  }
}

export function eraseAll(store: Store): void {
  for (const key of [...Object.keys(BACKUP_KEYS), ...OTHER_KEYS]) store.removeItem(key);
}

