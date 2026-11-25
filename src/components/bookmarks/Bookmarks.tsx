"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toBnDigits } from "@/lib/bn";
import { add, addFolder, addHadith, change, changeHadith, folderNameError, fromBackup, keyOf, merge, NAME_MAX, NOTE_MAX, remove, removeFolder, removeHadith, renameFolder, restore, restoreHadith, toBackup, type Bookmark, type HadithMark, type Library } from "@/lib/bookmarks/model";
import { update, useLibrary } from "@/lib/bookmarks/store";
import type { Hadith } from "@/lib/hadith/types";
import { loadSurah } from "@/lib/quran/load";
import type { Ayah, SurahInfo } from "@/lib/quran/types";
import { GradeBadge } from "@/components/hadith/GradeBadge";
import { headerButton, ScreenHeader } from "@/components/shell/ScreenHeader";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Seg } from "@/components/ui/Seg";
import { Skeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import { SwipeRow } from "./SwipeRow";

const card = "rounded-md border border-ln bg-sf px-4 py-2.5 shadow-card";
const field = "min-h-12 min-w-0 flex-1 rounded-md border border-ln2 bg-bg px-3 text-base";

/** The ayah text is fetched when the card appears; the card works even if that fails. */
function AyahText({ s, a }: { s: number; a: number }) {
  const [ayah, setAyah] = useState<Ayah | "failed" | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    loadSurah(s).then((data) => { if (alive) setAyah(data.ayahs[a - 1]); }, () => { if (alive) setAyah("failed"); });
    return () => { alive = false; };
  }, [s, a, attempt]);

  if (ayah === "failed") return <button type="button" className="min-h-11 text-sm text-ac underline" onClick={() => { setAyah(null); setAttempt((n) => n + 1); }}>আয়াতের লেখা আনা যায়নি, আবার চেষ্টা করুন</button>;
  if (!ayah) return <div className="space-y-2 py-3"><Skeleton className="h-9" /><Skeleton /></div>;
  return (
    <>
      <p lang="ar" dir="rtl" className="line-clamp-3 font-arabic text-[1.375rem] leading-[2.25]">{ayah.ar}</p>
      <p className="reading line-clamp-2 text-sm leading-[1.75] text-gt">{ayah.tr}</p>
      <p className="reading mt-0.5 line-clamp-3 text-[0.9375rem] leading-[1.75]">{ayah.bn}</p>
    </>
  );
}

/** Title and grade come from the published data each time, so a corrected text is what gets shown. */
function HadithText({ id }: { id: number }) {
  const [hadith, setHadith] = useState<Hadith | "failed" | "gone" | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    const show = (value: Hadith | "failed" | "gone") => { if (alive) setHadith(value); };
    fetch(`/data/hadith/item/${id}.json`).then(async (r) => {
      if (r.status === 404) return show("gone");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      show((await r.json()) as Hadith);
    }).catch(() => show("failed"));
    return () => { alive = false; };
  }, [id, attempt]);

  if (hadith === "gone") return <p className="py-2 text-sm text-ink2">এই হাদিসটি এখনকার প্রকাশিত তালিকায় নেই। আপনার নোট রাখা আছে।</p>;
  if (hadith === "failed") return <button type="button" className="min-h-11 text-sm text-ac underline" onClick={() => { setHadith(null); setAttempt((n) => n + 1); }}>হাদিসের লেখা আনা যায়নি, আবার চেষ্টা করুন</button>;
  if (!hadith) return <div className="space-y-2 py-3"><Skeleton /><Skeleton className="h-4 w-2/3" /></div>;
  return (
    <Link href={`/hadith/${id}/`} prefetch={false} className="block py-1">
      <p className="line-clamp-3 font-display font-semibold leading-relaxed">{hadith.title}</p>
      <p className="mt-1 line-clamp-3 text-[0.9375rem] leading-[1.75]">{hadith.hadeeth}</p>
      <span className="mt-1 flex min-h-11 items-center justify-between gap-3">
        <GradeBadge cls={hadith.gradeClass} />
        <span className="text-sm font-semibold text-ac underline">পুরো হাদিস পড়ুন</span>
      </span>
    </Link>
  );
}

function FolderSelect({ folders, value, onChange }: { folders: Library["folders"]; value: string | null; onChange: (folder: string | null) => void }) {
  if (folders.length === 0) return <p className="text-sm text-ink2">ফোল্ডারে রাখতে চাইলে আগে একটি ফোল্ডার বানান।</p>;
  return (
    <label className="flex items-center gap-3 text-sm">ফোল্ডার
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className={field}>
        <option value="">ফোল্ডার ছাড়া</option>
        {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
    </label>
  );
}

function NewFolderSheet({ library, onMake, onClose }: { library: Library; onMake: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  return (
    <BottomSheet title="নতুন ফোল্ডার" onClose={onClose}>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); const problem = folderNameError(library, name); if (problem) return setError(problem); onMake(name); }}>
        <div className="flex gap-2">
          <input aria-label="নতুন ফোল্ডারের নাম" data-autofocus maxLength={NAME_MAX} value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="যেমন: মুখস্থ করব" className={field} />
          <button type="submit" className="min-h-12 shrink-0 rounded-full bg-ac px-5 font-semibold text-on-ac">বানান</button>
        </div>
        {error && <p role="alert" className="text-sm text-gt">{error}</p>}
      </form>
    </BottomSheet>
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
          <input aria-label="ফোল্ডারের নতুন নাম" autoFocus maxLength={NAME_MAX} value={name} onChange={(e) => { setName(e.target.value); setError(""); }} className={field} />
          <Chip type="submit" selected>সেভ</Chip>
          <Chip onClick={() => setMode("none")}>বাতিল</Chip>
        </div>
        {error && <p role="alert" className="text-sm text-gt">{error}</p>}
      </form>
    );
  }
  if (mode === "delete") {
    return (
      <div className={card}>
        <p className="mb-2">“{folder.name}” ফোল্ডার মুছবেন? ভেতরের বুকমার্কগুলো থেকে যাবে।</p>
        <div className="flex flex-wrap gap-2">
          <Chip selected onClick={() => { save((l) => removeFolder(l, folderId)); onDone(); }}>ফোল্ডার মুছুন</Chip>
          <Chip onClick={() => setMode("none")}>বাতিল</Chip>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Chip onClick={() => { setName(folder.name); setMode("rename"); }}><Icon name="note" className="size-4" /> নাম বদলান</Chip>
      <Chip onClick={() => setMode("delete")}><Icon name="trash" className="size-4" /> ফোল্ডার মুছুন</Chip>
    </div>
  );
}

type Entry = { kind: "ayah"; key: string; item: Bookmark } | { kind: "hadith"; key: string; item: HadithMark };
const ayahEntry = (item: Bookmark): Entry => ({ kind: "ayah", key: keyOf(item), item });
const hadithEntry = (item: HadithMark): Entry => ({ kind: "hadith", key: `h${item.id}`, item });

/** One bookmark: its words, its folder, its note and a menu with everything that can be done to it. */
function Card({ entry, label, folder, onMenu, onDelete }: { entry: Entry; label: string; folder?: string; onMenu: () => void; onDelete: () => void }) {
  const { item } = entry;
  const href = entry.kind === "ayah" ? `/quran/${entry.item.s}/#a${entry.item.a}` : `/hadith/${entry.item.id}/`;
  return (
    <li>
      <SwipeRow onDelete={onDelete}>
        <div className={card}>
          <div className="flex items-center gap-2">
            <Link href={href} prefetch={false} className="flex min-h-11 min-w-0 flex-1 items-center text-[0.8125rem] text-ink2"><span className="truncate">{label}</span></Link>
            {folder && <span className="max-w-[40%] shrink-0 truncate rounded-full border border-ln2 px-2.5 text-xs leading-6">{folder}</span>}
            <button type="button" aria-label={`${label}: অপশন`} aria-haspopup="dialog" onClick={onMenu} className="-mr-3 grid size-11 shrink-0 place-items-center rounded-xl text-ink2"><Icon name="dots" className="size-5" /></button>
          </div>
          {entry.kind === "ayah" ? <Link href={href} prefetch={false} className="block"><AyahText s={entry.item.s} a={entry.item.a} /></Link> : <HadithText id={entry.item.id} />}
          {item.note && (
            <button type="button" aria-haspopup="dialog" aria-label={`${label}: নোট বদলান`} onClick={onMenu} className="mb-1 mt-2 flex min-h-11 w-full items-start gap-2 rounded-[0.625rem] bg-gs px-2.5 py-2 text-left text-[0.8125rem]">
              <Icon name="note" className="mt-0.5 size-[1.125rem] text-gt" />
              <span className="whitespace-pre-wrap break-words">{item.note}</span>
            </button>
          )}
        </div>
      </SwipeRow>
    </li>
  );
}

function EntrySheet({ entry, label, folders, save, onDelete, onClose }: { entry: Entry; label: string; folders: Library["folders"]; save: (f: (l: Library) => Library) => boolean; onDelete: () => void; onClose: () => void }) {
  const [draft, setDraft] = useState(entry.item.note);
  const saveNote = (e: React.FormEvent) => {
    e.preventDefault();
    const note = draft.trim();
    const stored = save((l) => (entry.kind === "ayah"
      ? change(add(l, entry.item.s, entry.item.a, Date.now()), entry.item.s, entry.item.a, { note }, Date.now())
      : changeHadith(addHadith(l, entry.item.id, Date.now()), entry.item.id, { note }, Date.now())));
    if (stored) { showToast("নোট সেভ হয়েছে"); onClose(); }
  };
  return (
    <BottomSheet title={label} onClose={onClose}>
      <form onSubmit={saveNote} className="space-y-2">
        <label className="block text-sm font-semibold">নোট
          <textarea rows={4} maxLength={NOTE_MAX} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="নিজের জন্য কিছু লিখে রাখুন" className="mt-1.5 w-full rounded-md border border-ln2 bg-bg p-3 text-base font-normal" />
        </label>
        <button type="submit" className="h-12 w-full rounded-full bg-ac font-semibold text-on-ac">নোট সেভ করুন</button>
      </form>
      <FolderSelect
        folders={folders}
        value={entry.item.folder}
        onChange={(folder) => save((l) => (entry.kind === "ayah" ? change(l, entry.item.s, entry.item.a, { folder }, Date.now()) : changeHadith(l, entry.item.id, { folder }, Date.now())))}
      />
      <div className="grid grid-cols-2 gap-2">
        <Link href={entry.kind === "ayah" ? `/quran/${entry.item.s}/#a${entry.item.a}` : `/hadith/${entry.item.id}/`} className="flex min-h-12 items-center justify-center rounded-full border border-ln2 font-semibold text-ac">খুলুন</Link>
        <button type="button" onClick={onDelete} className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-ln2 font-semibold"><Icon name="trash" className="size-5" /> মুছুন</button>
      </div>
    </BottomSheet>
  );
}

const KINDS = [{ value: "ayah", text: "আয়াত" }, { value: "hadith", text: "হাদিস" }, { value: "note", text: "নোট" }] as const;
type Kind = (typeof KINDS)[number]["value"];
const HASH: Record<Kind, string> = { ayah: "", hadith: "#hadith", note: "#notes" };

function Inner({ surahs }: { surahs: SurahInfo[] }) {
  const library = useLibrary();
  const [filter, setFilter] = useState<string>("all");
  const [order, setOrder] = useState<"recent" | "quran">("recent");
  const [makingFolder, setMakingFolder] = useState(false);
  const [opened, setOpened] = useState<string | null>(null);
  // The open tab stays in the address, so coming back from a hadith returns to the same list.
  const [kind, setKind] = useState<Kind>(() => KINDS.find((k) => HASH[k.value] === location.hash)?.value ?? "ayah");
  const showKind = (next: Kind) => {
    setKind(next);
    history.replaceState(history.state, "", HASH[next] || location.pathname);
  };
  const [message, setMessage] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const save = (apply: (l: Library) => Library) => {
    const stored = update(apply);
    if (!stored) setMessage("ফোনে সেভ করা যাচ্ছে না। জায়গা খালি করুন বা প্রাইভেট মোড বন্ধ করুন, আর এখনই ব্যাকআপ নিন।");
    return stored;
  };
  const active = library.folders.some((f) => f.id === filter) ? filter : "all";
  const inFolder = (e: Entry) => active === "all" || e.item.folder === active;
  const newest = (a: Entry, b: Entry) => b.item.created - a.item.created;
  const ayahs = library.items.map(ayahEntry);
  const hadiths = library.hadiths.map(hadithEntry);
  const all = kind === "ayah" ? ayahs : kind === "hadith" ? hadiths : [...ayahs, ...hadiths].filter((e) => e.item.note);
  const shown = all.filter(inFolder).sort((a, b) => (kind === "ayah" && order === "quran" && a.kind === "ayah" && b.kind === "ayah" ? a.item.s - b.item.s || a.item.a - b.item.a : newest(a, b)));
  const nothingSaved = library.items.length === 0 && library.hadiths.length === 0 && library.folders.length === 0;

  // Hadiths have no number of their own, so they are counted in the order they are listed.
  const hadithNumbers = new Map(shown.filter((e) => e.kind === "hadith").map((e, i) => [e.key, i + 1]));
  const labelOf = (e: Entry) => (e.kind === "ayah"
    ? `সূরা ${surahs[e.item.s - 1].bangla} ${toBnDigits(e.item.s)}:${toBnDigits(e.item.a)}`
    : `হাদিস ${hadithNumbers.has(e.key) ? toBnDigits(hadithNumbers.get(e.key)!) : ""}`.trim());
  const openedEntry = opened === null ? undefined : [...ayahs, ...hadiths].find((e) => e.key === opened);

  const deleteEntry = (entry: Entry) => {
    const label = labelOf(entry);
    setOpened(null);
    save((l) => (entry.kind === "ayah" ? remove(l, entry.item.s, entry.item.a) : removeHadith(l, entry.item.id)));
    // Longer than other messages: this is the way back to a note.
    showToast(`${label} মুছে ফেলা হয়েছে`, { label: "ফিরিয়ে আনুন", run: () => { save((l) => (entry.kind === "ayah" ? restore(l, entry.item) : restoreHadith(l, entry.item))); } }, 10_000);
  };

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

  const empty = {
    ayah: { title: "এখনো কোনো আয়াত বুকমার্ক নেই", text: "পড়ার সময় আয়াতে চাপ দিয়ে ফিতা চিহ্নে চাপুন।", href: "/quran/", action: "কুরআন পড়ুন" },
    hadith: { title: "এখনো কোনো হাদিস বুকমার্ক নেই", text: "হাদিস পড়ার সময় উপরের ফিতা চিহ্নে চাপ দিন।", href: "/hadith/", action: "হাদিস পড়ুন" },
    note: { title: "এখনো কোনো নোট নেই", text: "আয়াত বা হাদিসে নোট লিখলে এখানে আসবে।", href: "/quran/", action: "কুরআন পড়ুন" },
  }[kind];

  return (
    <div className="space-y-4">
      <ScreenHeader title="বুকমার্ক" back={{ href: "/quran/", label: "কুরআনে ফিরে যান" }}>
        <button type="button" aria-label="নতুন ফোল্ডার" aria-haspopup="dialog" onClick={() => setMakingFolder(true)} className={headerButton}><Icon name="plus" /></button>
      </ScreenHeader>

      <Seg label="কিসের বুকমার্ক" options={KINDS} value={kind} onChange={showKind} />

      <div role="group" aria-label="ফোল্ডার" className="rail -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        <Chip aria-pressed={active === "all"} selected={active === "all"} onClick={() => setFilter("all")}>সব</Chip>
        {library.folders.map((f) => (
          <Chip key={f.id} aria-pressed={active === f.id} selected={active === f.id} onClick={() => setFilter(f.id)}>{f.name} ({toBnDigits(all.filter((e) => e.item.folder === f.id).length)})</Chip>
        ))}
        <Chip aria-haspopup="dialog" onClick={() => setMakingFolder(true)}><Icon name="plus" className="size-4" /> নতুন ফোল্ডার</Chip>
      </div>

      {active !== "all" && <FolderTools key={active} library={library} folderId={active} save={save} onDone={() => setFilter("all")} />}

      <div className="flex flex-wrap items-center justify-between gap-x-3 text-[0.8125rem] text-ink2">
        <p role="status">{toBnDigits(shown.length)}টি {kind === "note" ? "নোট" : "বুকমার্ক"}</p>
        <div className="flex items-center">
          {kind === "ayah" && library.items.length > 1 && (
            <button type="button" aria-label={`সাজানো: ${order === "recent" ? "নতুন আগে" : "কুরআনের ক্রমে"}। বদলাতে চাপুন`} onClick={() => setOrder(order === "recent" ? "quran" : "recent")} className="flex min-h-11 items-center gap-1.5 px-2">
              <Icon name="filter" className="size-[1.125rem]" /> {order === "recent" ? "নতুন আগে" : "কুরআনের ক্রমে"}
            </button>
          )}
          <button type="button" disabled={nothingSaved} onClick={download} className="-mr-2 flex min-h-11 items-center px-2 disabled:opacity-40">এক্সপোর্ট</button>
        </div>
      </div>

      {shown.length === 0 ? (
        all.length > 0
          ? <EmptyState icon="bookmark" title="এই ফোল্ডারে কিছু নেই">যেকোনো বুকমার্কের অপশন থেকে ফোল্ডার বেছে দিন।</EmptyState>
          : <EmptyState icon="bookmark" title={empty.title} action={<Link href={empty.href} className="flex h-12 items-center rounded-full bg-ac px-6 font-semibold text-on-ac">{empty.action}</Link>}>{empty.text}</EmptyState>
      ) : (
        <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-3 lg:space-y-0">
          {shown.map((e) => (
            <Card key={e.key} entry={e} label={labelOf(e)} folder={library.folders.find((f) => f.id === e.item.folder)?.name} onMenu={() => setOpened(e.key)} onDelete={() => deleteEntry(e)} />
          ))}
        </ul>
      )}

      <section className={`${card} !py-4`}>
        <h2 className="font-display font-semibold">ব্যাকআপ</h2>
        <p className="mb-3 text-sm text-ink2">বুকমার্ক ও নোট শুধু এই ফোনের এই ব্রাউজারেই থাকে। ব্রাউজারের ডেটা মুছলে বা ফোন বদলালে হারিয়ে যাবে, তাই মাঝে মাঝে ব্যাকআপ রাখুন।</p>
        <div className="flex flex-wrap gap-2">
          <Chip disabled={nothingSaved} className="disabled:opacity-40" onClick={download}><Icon name="download" className="size-4" /> ব্যাকআপ নিন</Chip>
          <Chip onClick={() => file.current?.click()}><Icon name="upload" className="size-4" /> ব্যাকআপ ফিরিয়ে আনুন</Chip>
          <input ref={file} type="file" accept="application/json,.json" aria-label="ব্যাকআপ ফাইল" className="hidden" onChange={(e) => { void importFile(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
        <p role="status" className="mt-2 text-sm text-gt empty:hidden">{message}</p>
      </section>

      {openedEntry && <EntrySheet key={openedEntry.key} entry={openedEntry} label={labelOf(openedEntry)} folders={library.folders} save={save} onDelete={() => deleteEntry(openedEntry)} onClose={() => setOpened(null)} />}
      {makingFolder && (
        <NewFolderSheet
          library={library}
          onClose={() => setMakingFolder(false)}
          onMake={(name) => { const id = `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`; save((l) => addFolder(l, id, name)); setMakingFolder(false); setFilter("all"); }}
        />
      )}
    </div>
  );
}

const never = () => () => {};

/** Bookmarks live on the device, so the list appears only in the browser. */
export function Bookmarks({ surahs }: { surahs: SurahInfo[] }) {
  const ready = useSyncExternalStore(never, () => true, () => false);
  return ready ? <Inner surahs={surahs} /> : <div className="space-y-4"><Skeleton className="h-12" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;
}
