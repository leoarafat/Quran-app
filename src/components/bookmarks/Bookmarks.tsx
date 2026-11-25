"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Download, FolderPlus, Pencil, Trash2, Undo2, Upload } from "lucide-react";
import { toBnDigits } from "@/lib/bn";
import { add, addFolder, change, folderNameError, fromBackup, keyOf, merge, NAME_MAX, NOTE_MAX, remove, removeFolder, renameFolder, restore, toBackup, type Bookmark, type Library } from "@/lib/bookmarks/model";
import { update, useLibrary } from "@/lib/bookmarks/store";
import type { Ayah, SurahData, SurahInfo } from "@/lib/quran/types";

const chip = (active: boolean) => `min-h-11 rounded-full border px-4 ${active ? "border-brand bg-brand font-semibold text-on-brand" : "border-line-strong bg-surface"}`;
const card = "rounded-[1.375rem] border border-line bg-surface p-4";
const iconButton = "grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-accent";

const surahCache = new Map<number, Promise<SurahData>>();
function loadSurah(n: number): Promise<SurahData> {
  let request = surahCache.get(n);
  if (!request) {
    request = fetch(`/data/quran/${n}.json`).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<SurahData>;
    });
    surahCache.set(n, request);
    request.catch(() => surahCache.delete(n));
  }
  return request;
}

/** The ayah text is fetched when the card appears; the card works even if that fails. */
function AyahText({ s, a }: { s: number; a: number }) {
  const [ayah, setAyah] = useState<Ayah | "failed" | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    loadSurah(s).then((data) => { if (alive) setAyah(data.ayahs[a - 1]); }, () => { if (alive) setAyah("failed"); });
    return () => { alive = false; };
  }, [s, a, attempt]);

  if (ayah === "failed") return <button type="button" className="min-h-11 text-sm text-accent underline" onClick={() => { setAyah(null); setAttempt((n) => n + 1); }}>আয়াতের লেখা আনা যায়নি, আবার চেষ্টা করুন</button>;
  if (!ayah) return <p className="min-h-24 text-sm text-muted">আনা হচ্ছে…</p>;
  return (
    <>
      <p lang="ar" dir="rtl" className="line-clamp-3 font-arabic text-2xl leading-[2.2]">{ayah.ar}</p>
      <p className="line-clamp-2 font-display text-[0.9375rem] leading-[1.8] text-accent">{ayah.tr}</p>
      <p className="mt-1 line-clamp-3 leading-relaxed text-soft">{ayah.bn}</p>
    </>
  );
}

function NoteEditor({ item, onSave }: { item: Bookmark; onSave: (note: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  if (draft === null) {
    return (
      <button type="button" className="mt-2 block min-h-11 w-full rounded-2xl border border-dashed border-line-strong px-3 py-2 text-left" onClick={() => setDraft(item.note)}>
        {item.note ? <span className="whitespace-pre-wrap break-words">{item.note}</span> : <span className="text-muted">+ নোট লিখুন</span>}
      </button>
    );
  }
  return (
    <form className="mt-2 space-y-2" onSubmit={(e) => { e.preventDefault(); onSave(draft.trim()); setDraft(null); }}>
      <label className="sr-only" htmlFor={`note-${keyOf(item)}`}>নোট</label>
      <textarea id={`note-${keyOf(item)}`} autoFocus rows={3} maxLength={NOTE_MAX} value={draft} onChange={(e) => setDraft(e.target.value)} className="w-full rounded-2xl border border-line-strong bg-bg p-3" />
      <div className="flex gap-2">
        <button type="submit" className={chip(true)}>সেভ করুন</button>
        <button type="button" className={chip(false)} onClick={() => setDraft(null)}>বাতিল</button>
      </div>
    </form>
  );
}

function FolderTools({ library, folderId, onDone, save }: { library: Library; folderId: string; onDone: () => void; save: (f: (l: Library) => Library) => void }) {
  const folder = library.folders.find((f) => f.id === folderId)!;
  const [mode, setMode] = useState<"none" | "rename" | "delete">("none");
  const [name, setName] = useState(folder.name);
  const [error, setError] = useState("");

  if (mode === "rename") {
    return (
      <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); const problem = folderNameError(library, name, folderId); if (problem) return setError(problem); save((l) => renameFolder(l, folderId, name)); setMode("none"); }}>
        <div className="flex gap-2">
          <input aria-label="ফোল্ডারের নতুন নাম" autoFocus maxLength={NAME_MAX} value={name} onChange={(e) => { setName(e.target.value); setError(""); }} className="min-h-11 min-w-0 flex-1 rounded-full border border-line-strong bg-surface px-4" />
          <button type="submit" className={chip(true)}>সেভ</button>
          <button type="button" className={chip(false)} onClick={() => setMode("none")}>বাতিল</button>
        </div>
        {error && <p role="alert" className="text-sm text-accent">{error}</p>}
      </form>
    );
  }
  if (mode === "delete") {
    return (
      <div className={card}>
        <p className="mb-2">“{folder.name}” ফোল্ডার মুছবেন? ভেতরের বুকমার্কগুলো থেকে যাবে।</p>
        <div className="flex gap-2">
          <button type="button" className={chip(true)} onClick={() => { save((l) => removeFolder(l, folderId)); onDone(); }}>ফোল্ডার মুছুন</button>
          <button type="button" className={chip(false)} onClick={() => setMode("none")}>বাতিল</button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      <button type="button" className={`${chip(false)} flex items-center gap-2`} onClick={() => { setName(folder.name); setMode("rename"); }}><Pencil aria-hidden className="size-4" /> নাম বদলান</button>
      <button type="button" className={`${chip(false)} flex items-center gap-2`} onClick={() => setMode("delete")}><Trash2 aria-hidden className="size-4" /> ফোল্ডার মুছুন</button>
    </div>
  );
}

function Inner({ surahs }: { surahs: SurahInfo[] }) {
  const library = useLibrary();
  const [filter, setFilter] = useState<string>("all");
  const [order, setOrder] = useState<"recent" | "quran">("recent");
  const [newFolder, setNewFolder] = useState<string | null>(null);
  const [folderError, setFolderError] = useState("");
  const [removed, setRemoved] = useState<Bookmark | null>(null);
  const [message, setMessage] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const save = (apply: (l: Library) => Library) => {
    if (!update(apply)) setMessage("ফোনে সেভ করা যাচ্ছে না। জায়গা খালি করুন বা প্রাইভেট মোড বন্ধ করুন, আর এখনই ব্যাকআপ নিন।");
  };
  const active = library.folders.some((f) => f.id === filter) ? filter : "all";
  const items = library.items
    .filter((b) => active === "all" || b.folder === active)
    .sort((x, y) => (order === "quran" ? x.s - y.s || x.a - y.a : y.created - x.created));

  const download = () => {
    const url = URL.createObjectURL(new Blob([toBackup(library)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `noor-quran-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("ব্যাকআপ ফাইল তৈরি হয়েছে। ফাইলটি নিরাপদ জায়গায় রাখুন।");
  };

  const importFile = async (chosen: File | undefined) => {
    if (!chosen) return;
    // A real backup is far smaller than this; refuse anything that would freeze the phone.
    const incoming = chosen.size <= 5_000_000 ? fromBackup(await chosen.text().catch(() => "")) : null;
    if (!incoming) return setMessage("এটি সঠিক ব্যাকআপ ফাইল নয়। আপনার বর্তমান বুকমার্কে কিছু বদলায়নি।");
    let summary = "";
    const stored = update((current) => {
      const result = merge(current, incoming);
      summary = `ব্যাকআপ থেকে ${toBnDigits(result.added)}টি নতুন বুকমার্ক যোগ হয়েছে, ${toBnDigits(result.updated)}টি হালনাগাদ হয়েছে।`;
      return result.library;
    });
    setMessage(stored ? summary : `${summary} কিন্তু ফোনে সেভ করা যায়নি।`);
  };

  return (
    <div className="space-y-4">
      <div role="group" aria-label="ফোল্ডার" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={active === "all"} className={chip(active === "all")} onClick={() => setFilter("all")}>সব ({toBnDigits(library.items.length)})</button>
        {library.folders.map((f) => (
          <button key={f.id} type="button" aria-pressed={active === f.id} className={`${chip(active === f.id)} max-w-full truncate`} onClick={() => setFilter(f.id)}>{f.name} ({toBnDigits(library.items.filter((b) => b.folder === f.id).length)})</button>
        ))}
        <button type="button" className={`${chip(false)} flex items-center gap-2 text-accent`} onClick={() => { setNewFolder(""); setFolderError(""); }}><FolderPlus aria-hidden className="size-4" /> নতুন ফোল্ডার</button>
      </div>

      {newFolder !== null && (
        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); const problem = folderNameError(library, newFolder); if (problem) return setFolderError(problem); const id = `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`; save((l) => addFolder(l, id, newFolder)); setNewFolder(null); setFilter("all"); }}>
          <div className="flex gap-2">
            <input aria-label="নতুন ফোল্ডারের নাম" autoFocus maxLength={NAME_MAX} value={newFolder} onChange={(e) => { setNewFolder(e.target.value); setFolderError(""); }} placeholder="যেমন: মুখস্থ করব" className="min-h-11 min-w-0 flex-1 rounded-full border border-line-strong bg-surface px-4" />
            <button type="submit" className={chip(true)}>বানান</button>
            <button type="button" className={chip(false)} onClick={() => setNewFolder(null)}>বাতিল</button>
          </div>
          {folderError && <p role="alert" className="text-sm text-accent">{folderError}</p>}
        </form>
      )}

      {active !== "all" && <FolderTools key={active} library={library} folderId={active} save={save} onDone={() => setFilter("all")} />}

      {library.items.length > 1 && (
        <div role="group" aria-label="সাজানো" className="flex gap-2 text-sm">
          <button type="button" aria-pressed={order === "recent"} className={chip(order === "recent")} onClick={() => setOrder("recent")}>নতুন আগে</button>
          <button type="button" aria-pressed={order === "quran"} className={chip(order === "quran")} onClick={() => setOrder("quran")}>কুরআনের ক্রমে</button>
        </div>
      )}

      {removed && (
        <div className="flex items-center justify-between gap-3 rounded-full border border-gold bg-active px-4 py-1">
          <span role="status" className="truncate">{surahs[removed.s - 1].bangla} {toBnDigits(removed.a)} মুছে ফেলা হয়েছে</span>
          <button type="button" className="flex min-h-11 shrink-0 items-center gap-1 font-semibold text-accent" onClick={() => { const item = removed; save((l) => restore(l, item)); setRemoved(null); }}><Undo2 aria-hidden className="size-4" /> ফিরিয়ে আনুন</button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-[1.375rem] border border-dashed border-line-strong p-6 text-center text-muted">
          {library.items.length === 0
            ? <>এখনো কোনো বুকমার্ক নেই। কুরআন পড়ার সময় আয়াতের পাশের ফিতা চিহ্নে চাপ দিন।<br /><Link href="/quran/" className="mt-3 inline-flex min-h-11 items-center font-semibold text-accent underline">কুরআন খুলুন</Link></>
            : "এই ফোল্ডারে কিছু নেই। যেকোনো বুকমার্কের নিচ থেকে ফোল্ডার বেছে দিন।"}
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((b) => (
            <li key={keyOf(b)} className={card}>
              <div className="flex items-center gap-2">
                <Link href={`/quran/${b.s}/#a${b.a}`} prefetch={false} className="flex min-h-11 min-w-0 flex-1 items-center font-display font-semibold text-accent">
                  <span className="truncate">সূরা {surahs[b.s - 1].bangla} · {toBnDigits(b.s)}:{toBnDigits(b.a)}</span>
                </Link>
                <button type="button" aria-label={`${toBnDigits(b.s)}:${toBnDigits(b.a)} বুকমার্ক মুছুন`} className={iconButton} onClick={() => { setRemoved(b); save((l) => remove(l, b.s, b.a)); }}><Trash2 aria-hidden className="size-[1.125rem]" /></button>
              </div>
              <Link href={`/quran/${b.s}/#a${b.a}`} prefetch={false} className="block"><AyahText s={b.s} a={b.a} /></Link>
              <NoteEditor item={b} onSave={(note) => save((l) => change(add(l, b.s, b.a, Date.now()), b.s, b.a, { note }, Date.now()))} />
              {library.folders.length > 0 && (
                <label className="mt-2 flex items-center gap-2 text-sm text-muted">ফোল্ডার
                  <select value={b.folder ?? ""} onChange={(e) => save((l) => change(l, b.s, b.a, { folder: e.target.value || null }, Date.now()))} className="min-h-11 min-w-0 flex-1 rounded-2xl border border-line-strong bg-surface px-2 text-base text-text">
                    <option value="">ফোল্ডার ছাড়া</option>
                    {library.folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </label>
              )}
            </li>
          ))}
        </ul>
      )}

      <section className={card}>
        <h2 className="font-display font-semibold">ব্যাকআপ</h2>
        <p className="mb-3 text-sm text-muted">বুকমার্ক ও নোট শুধু এই ফোনের এই ব্রাউজারেই থাকে। ব্রাউজারের ডেটা মুছলে বা ফোন বদলালে হারিয়ে যাবে, তাই মাঝে মাঝে ব্যাকআপ রাখুন।</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={`${chip(false)} flex items-center gap-2 disabled:opacity-40`} disabled={library.items.length === 0 && library.folders.length === 0} onClick={download}><Download aria-hidden className="size-4" /> ব্যাকআপ নিন</button>
          <button type="button" className={`${chip(false)} flex items-center gap-2`} onClick={() => file.current?.click()}><Upload aria-hidden className="size-4" /> ব্যাকআপ ফিরিয়ে আনুন</button>
          <input ref={file} type="file" accept="application/json,.json" aria-label="ব্যাকআপ ফাইল" className="hidden" onChange={(e) => { void importFile(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
        <p role="status" className="mt-2 text-sm text-accent empty:hidden">{message}</p>
      </section>
    </div>
  );
}

const never = () => () => {};

/** Bookmarks live on the device, so the list appears only in the browser. */
export function Bookmarks({ surahs }: { surahs: SurahInfo[] }) {
  const ready = useSyncExternalStore(never, () => true, () => false);
  return ready ? <Inner surahs={surahs} /> : <p className="text-muted">আনা হচ্ছে…</p>;
}
