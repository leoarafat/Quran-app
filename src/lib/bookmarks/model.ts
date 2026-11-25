// Pure rules for bookmarks. This is the visitor's own data: nothing here may lose it by accident.

export type Folder = { id: string; name: string };
export type Bookmark = { s: number; a: number; folder: string | null; note: string; created: number; updated: number };
export type Library = { version: 1; folders: Folder[]; items: Bookmark[] };

export const EMPTY: Library = { version: 1, folders: [], items: [] };
export const NOTE_MAX = 2000;
export const NAME_MAX = 40;
const FOLDER_MAX = 100;

const AYAH_COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];

export const isAyah = (s: number, a: number) => Number.isInteger(s) && Number.isInteger(a) && s >= 1 && s <= 114 && a >= 1 && a <= AYAH_COUNTS[s - 1];
export const keyOf = (b: { s: number; a: number }) => `${b.s}:${b.a}`;

const isObject = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

/** Reads anything and keeps only what is valid. Returns null if it is not a bookmark library at all. */
export function readLibrary(data: unknown): Library | null {
  if (!isObject(data) || data.version !== 1 || !Array.isArray(data.items) || !Array.isArray(data.folders)) return null;
  const folders: Folder[] = [];
  for (const f of data.folders) {
    if (!isObject(f) || typeof f.id !== "string" || typeof f.name !== "string") continue;
    const name = f.name.trim().slice(0, NAME_MAX);
    if (name && f.id && !folders.some((x) => x.id === f.id) && folders.length < FOLDER_MAX) folders.push({ id: f.id, name });
  }
  const items = new Map<string, Bookmark>();
  for (const b of data.items) {
    if (!isObject(b) || typeof b.s !== "number" || typeof b.a !== "number" || !isAyah(b.s, b.a)) continue;
    const time = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : 0);
    const item: Bookmark = {
      s: b.s,
      a: b.a,
      folder: typeof b.folder === "string" && folders.some((f) => f.id === b.folder) ? b.folder : null,
      note: typeof b.note === "string" ? b.note.slice(0, NOTE_MAX) : "",
      created: time(b.created),
      updated: time(b.updated),
    };
    const old = items.get(keyOf(item));
    if (!old || item.updated >= old.updated) items.set(keyOf(item), item);
  }
  return { version: 1, folders, items: [...items.values()] };
}

export const find = (lib: Library, s: number, a: number) => lib.items.find((b) => b.s === s && b.a === a);

export function add(lib: Library, s: number, a: number, now: number): Library {
  if (!isAyah(s, a) || find(lib, s, a)) return lib;
  return { ...lib, items: [...lib.items, { s, a, folder: null, note: "", created: now, updated: now }] };
}

export const remove = (lib: Library, s: number, a: number): Library => ({ ...lib, items: lib.items.filter((b) => b.s !== s || b.a !== a) });

/** Puts back a bookmark exactly as it was (undo). */
export const restore = (lib: Library, item: Bookmark): Library => (find(lib, item.s, item.a) ? lib : { ...lib, items: [...lib.items, item] });

export function change(lib: Library, s: number, a: number, patch: Partial<Pick<Bookmark, "folder" | "note">>, now: number): Library {
  return {
    ...lib,
    items: lib.items.map((b) => {
      if (b.s !== s || b.a !== a) return b;
      const folder = patch.folder === undefined ? b.folder : lib.folders.some((f) => f.id === patch.folder) ? patch.folder : null;
      return { ...b, folder, note: patch.note === undefined ? b.note : patch.note.slice(0, NOTE_MAX), updated: now };
    }),
  };
}

const sameName = (a: string, b: string) => a.trim().normalize("NFD").toLowerCase() === b.trim().normalize("NFD").toLowerCase();

export function folderNameError(lib: Library, name: string, ignoreId?: string): string | null {
  if (!name.trim()) return "ফোল্ডারের নাম লিখুন";
  if (name.trim().length > NAME_MAX) return "নামটি আরও ছোট করুন";
  if (lib.folders.some((f) => f.id !== ignoreId && sameName(f.name, name))) return "এই নামে ফোল্ডার আগে থেকেই আছে";
  if (!ignoreId && lib.folders.length >= FOLDER_MAX) return "আর ফোল্ডার বানানো যাবে না";
  return null;
}

export const addFolder = (lib: Library, id: string, name: string): Library =>
  folderNameError(lib, name) ? lib : { ...lib, folders: [...lib.folders, { id, name: name.trim() }] };

export const renameFolder = (lib: Library, id: string, name: string): Library =>
  folderNameError(lib, name, id) ? lib : { ...lib, folders: lib.folders.map((f) => (f.id === id ? { ...f, name: name.trim() } : f)) };

/** Bookmarks inside are kept; they just stop belonging to a folder. */
export const removeFolder = (lib: Library, id: string): Library => ({
  ...lib,
  folders: lib.folders.filter((f) => f.id !== id),
  items: lib.items.map((b) => (b.folder === id ? { ...b, folder: null } : b)),
});

/** Adds a backup into what is already here. Nothing is deleted; for the same ayah the newer edit wins. */
export function merge(current: Library, incoming: Library): { library: Library; added: number; updated: number } {
  const folders = [...current.folders];
  const folderMap = new Map<string, string>();
  for (const f of incoming.folders) {
    const match = folders.find((x) => x.id === f.id) ?? folders.find((x) => sameName(x.name, f.name));
    if (match) folderMap.set(f.id, match.id);
    else if (folders.length < FOLDER_MAX) {
      folders.push(f);
      folderMap.set(f.id, f.id);
    }
  }
  const items = new Map(current.items.map((b) => [keyOf(b), b]));
  let added = 0;
  let updated = 0;
  for (const b of incoming.items) {
    const next = { ...b, folder: b.folder ? (folderMap.get(b.folder) ?? null) : null };
    const old = items.get(keyOf(b));
    if (!old) added++;
    else if (next.updated > old.updated) updated++;
    else continue;
    items.set(keyOf(b), next);
  }
  return { library: { version: 1, folders, items: [...items.values()] }, added, updated };
}

export const toBackup = (lib: Library) => JSON.stringify({ app: "noor-quran", ...lib }, null, 2);

export function fromBackup(text: string): Library | null {
  try {
    return readLibrary(JSON.parse(text));
  } catch {
    return null;
  }
}
