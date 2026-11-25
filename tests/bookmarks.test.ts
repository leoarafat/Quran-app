import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { add, addFolder, change, EMPTY, find, folderNameError, fromBackup, isAyah, merge, readLibrary, remove, removeFolder, renameFolder, restore, toBackup, type Library } from "@/lib/bookmarks/model";

const base = () => add(add(addFolder(EMPTY, "f1", "মুখস্থ"), 2, 255, 100), 1, 5, 200);

describe("bookmarks", () => {
  it("knows exactly which ayahs exist", () => {
    const { surahs } = JSON.parse(readFileSync(new URL("../public/data/quran/index.json", import.meta.url), "utf8"));
    for (const s of surahs) {
      expect(isAyah(s.n, s.ayahs), `${s.n}`).toBe(true);
      expect(isAyah(s.n, s.ayahs + 1), `${s.n}`).toBe(false);
    }
  });
  it("adds once, never invalid ones, and removes", () => {
    const lib = base();
    expect(add(lib, 2, 255, 999)).toBe(lib);
    expect(add(lib, 2, 287, 1)).toBe(lib);
    expect(remove(lib, 2, 255).items).toHaveLength(1);
  });
  it("undo restores note and folder", () => {
    const lib = change(base(), 2, 255, { folder: "f1", note: "আমার নোট" }, 300);
    const gone = find(lib, 2, 255)!;
    expect(find(restore(remove(lib, 2, 255), gone), 2, 255)).toEqual(gone);
  });
  it("refuses a folder that does not exist", () => expect(find(change(base(), 2, 255, { folder: "nope" }, 1), 2, 255)!.folder).toBeNull());
  it("keeps bookmarks when a folder is deleted", () => {
    const lib = removeFolder(change(base(), 2, 255, { folder: "f1" }, 1), "f1");
    expect(lib.folders).toEqual([]);
    expect(lib.items).toHaveLength(2);
    expect(find(lib, 2, 255)!.folder).toBeNull();
  });
  it("validates folder names", () => {
    expect(folderNameError(base(), "  ")).toBeTruthy();
    expect(folderNameError(base(), " মুখস্থ ")).toBeTruthy();
    expect(folderNameError(base(), "ক".repeat(41))).toBeTruthy();
    expect(renameFolder(base(), "f1", "মুখস্থ").folders[0].name).toBe("মুখস্থ");
  });
});

describe("backup", () => {
  it("round-trips", () => {
    const lib = change(base(), 2, 255, { folder: "f1", note: "নোট\nদুই লাইন" }, 5);
    expect(fromBackup(toBackup(lib))).toEqual(lib);
  });
  it.each(["", "hello", "null", "[]", "{}", '{"version":2,"items":[],"folders":[]}', '{"version":1,"items":{}}'])("rejects %j", (text) => {
    expect(fromBackup(text)).toBeNull();
  });
  it("drops only the broken entries", () => {
    const lib = readLibrary({ version: 1, folders: [{ id: "x" }, null], items: [{ s: 999, a: 1 }, null, { s: 1, a: 1, folder: "ghost", note: 7 }] })!;
    expect(lib.items).toEqual([{ s: 1, a: 1, folder: null, note: "", created: 0, updated: 0 }]);
  });
  it("importing never deletes, and the newer edit wins", () => {
    const mine = change(base(), 2, 255, { note: "নতুন" }, 500);
    const old = change(add(add(EMPTY, 2, 255, 10), 3, 1, 10), 2, 255, { note: "পুরোনো" }, 20);
    const result = merge(mine, old);
    expect([result.added, result.updated]).toEqual([1, 0]);
    expect(result.library.items).toHaveLength(3);
    expect(find(result.library, 2, 255)!.note).toBe("নতুন");
    expect(merge(old, mine).updated).toBe(1);
  });
  it("joins folders that share a name", () => {
    const other = change(add(addFolder(EMPTY, "other", "মুখস্থ"), 4, 1, 1), 4, 1, { folder: "other" }, 2);
    const result = merge(base(), other).library;
    expect(result.folders).toHaveLength(1);
    expect(find(result, 4, 1)!.folder).toBe("f1");
  });
});

describe("saving on the device", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

  async function open(storage: Pick<Storage, "getItem" | "setItem">) {
    vi.stubGlobal("window", { localStorage: storage, addEventListener() {}, removeEventListener() {} });
    vi.resetModules();
    return import("@/lib/bookmarks/store");
  }
  const memory = (initial: Record<string, string> = {}) => {
    const data = { ...initial };
    return { data, getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => { data[k] = v; } };
  };
  const saved = (m: ReturnType<typeof memory>) => JSON.parse(m.data["noor.bookmarks.v1"]) as Library;

  it("does not overwrite a change made in another tab", async () => {
    const m = memory();
    const store = await open(m);
    store.update((l) => add(l, 1, 1, 1));
    m.data["noor.bookmarks.v1"] = JSON.stringify(add(saved(m), 1, 2, 2)); // the other tab
    store.update((l) => add(l, 1, 3, 3));
    expect(saved(m).items.map((b) => b.a)).toEqual([1, 2, 3]);
  });
  it("sets unreadable data aside instead of destroying it", async () => {
    const m = memory({ "noor.bookmarks.v1": "{broken" });
    const store = await open(m);
    store.update((l) => add(l, 1, 1, 1));
    expect(m.data["noor.bookmarks.unreadable"]).toBe("{broken");
    expect(saved(m).items).toHaveLength(1);
  });
  it("says so when the device refuses to save, and keeps them for this visit", async () => {
    const store = await open({ getItem: () => null, setItem: () => { throw new Error("full"); } });
    expect(store.update((l) => add(l, 1, 1, 1))).toBe(false);
    expect(store.update((l) => add(l, 1, 2, 2))).toBe(false);
    expect(store.getLibrary().items).toHaveLength(2);
  });
  it("works for this visit when storage is blocked", async () => {
    const blocked = () => { throw new Error("blocked"); };
    const store = await open({ getItem: blocked, setItem: blocked });
    store.update((l) => add(l, 1, 1, 1));
    store.update((l) => add(l, 1, 2, 2));
    expect(store.getLibrary().items).toHaveLength(2);
  });
});
