"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Seg } from "@/components/ui/Seg";
import { toBnDigits } from "@/lib/bn";
import { DEFAULT_HADITH_FILTERS } from "@/lib/hadith/search";
import type { QuranIndex, SurahInfo } from "@/lib/quran/types";
import { DEFAULT_FILTERS } from "@/lib/search/engine";
import { findPages } from "@/lib/search/features";
import { remember } from "@/lib/search/history";
import { directMatches, type Scope } from "@/lib/search/query";
import { useHadithSearch, useSearch } from "@/lib/search/useSearch";
import { Highlight } from "./Highlight";
import { useQueryText } from "./useQueryText";

const SCOPES = [{ value: "all", text: "সব" }, { value: "quran", text: "কুরআন" }, { value: "hadith", text: "হাদিস" }] as const;
const TOP = 5;

let surahList: Promise<SurahInfo[]> | null = null;
/** Fetched only when the palette is first opened, so no page carries the list for it. */
function loadSurahList() {
  surahList ??= fetch("/data/quran/index.json")
    .then((r) => (r.ok ? (r.json() as Promise<QuranIndex>) : Promise.reject(new Error(String(r.status)))))
    .then((index) => index.surahs)
    .catch((error) => { surahList = null; throw error; });
  return surahList;
}

type Item = { id: string; group: string; href: string; node: React.ReactNode };

const line = (icon: IconName, title: string, detail?: string) => (
  <span className="flex items-center gap-3">
    <Icon name={icon} className="size-5 text-ac" />
    <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
    {detail && <span className="shrink-0 text-[0.8125rem] text-ink2">{detail}</span>}
  </span>
);

/** Search from anywhere, driven from the keyboard: arrows choose, Enter opens, Tab changes where to look. */
export default function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const box = useRef<HTMLInputElement>(null);
  const listId = useId();
  const { text, query, type } = useQueryText("");
  const [scope, setScope] = useState<Scope>("all");
  const [active, setActive] = useState(0);
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  // An empty query asks nothing, so the side that is not wanted downloads nothing.
  const quran = useSearch(scope === "hadith" ? "" : query, DEFAULT_FILTERS, TOP);
  const hadith = useHadithSearch(scope === "quran" ? "" : query, DEFAULT_HADITH_FILTERS, TOP);

  useEffect(() => {
    const node = dialog.current;
    if (node && !node.open) node.showModal();
    // Only now: a box in a dialog that is not open yet would drag the page down to it.
    box.current?.focus();
    let alive = true;
    loadSurahList().then((list) => { if (alive) setSurahs(list); }, () => {});
    return () => { alive = false; };
  }, []);

  const items: Item[] = [];
  if (query && surahs.length) {
    if (scope !== "hadith") {
      const direct = directMatches(query, surahs);
      if (direct.named) items.push({ id: "named", group: "সরাসরি", href: `/quran/${direct.named.surah}/#a${direct.named.ayah}`, node: line("quran", direct.named.title, `${toBnDigits(direct.named.surah)}:${toBnDigits(direct.named.ayah)}`) });
      if (direct.reference) items.push({ id: "ref", group: "সরাসরি", href: `/quran/${direct.reference.surah}/#a${direct.reference.ayah}`, node: line("quran", `সূরা ${surahs[direct.reference.surah - 1].bangla}, আয়াত ${toBnDigits(direct.reference.ayah)}`) });
      for (const s of direct.surahs) items.push({ id: `s${s.n}`, group: "সরাসরি", href: `/quran/${s.n}/`, node: line("quran", `সূরা ${s.bangla}`, `${toBnDigits(s.ayahs)} আয়াত`) });
    }
    if (scope === "all") for (const p of findPages(query)) items.push({ id: `p${p.href}`, group: "অ্যাপের পাতা", href: p.href, node: line("more", p.title) });
    for (const r of quran.found?.results ?? []) {
      items.push({
        id: `q${r.s}:${r.a}`, group: "কুরআন", href: `/quran/${r.s}/#a${r.a}`,
        node: (
          <>
            <span className="block text-[0.8125rem] text-ink2">সূরা {surahs[r.s - 1].bangla} {toBnDigits(r.s)}:{toBnDigits(r.a)}</span>
            <span lang="ar" dir="rtl" className="block truncate font-arabic text-xl leading-[2.2]"><Highlight text={r.ar} words={r.marks.ar} /></span>
            <span className="line-clamp-2 leading-[1.7]"><Highlight text={r.bn} words={r.marks.bn} /></span>
          </>
        ),
      });
    }
    for (const r of hadith.found?.results ?? []) {
      items.push({
        id: `h${r.id}`, group: "হাদিস", href: `/hadith/${r.id}/`,
        node: (
          <>
            <span className="block truncate text-[0.8125rem] text-ink2">{r.attribution}</span>
            <span className="line-clamp-2 leading-[1.7]"><Highlight text={r.snippet} words={r.marks} /></span>
          </>
        ),
      });
    }
    const params = new URLSearchParams(scope === "all" ? { q: query } : { scope, q: query });
    items.push({ id: "all", group: "", href: `/search/?${params}`, node: line("search", "সব ফলাফল ও ফিল্টার দেখুন") });
  }
  const chosen = Math.min(active, Math.max(0, items.length - 1));
  const searching = quran.status === "searching" || hadith.status === "searching";
  const failed = quran.status === "error" || hadith.status === "error";

  // Only the result list scrolls; scrollIntoView could also move the page behind.
  useEffect(() => {
    const row = document.getElementById(`${listId}-${chosen}`);
    const list = document.getElementById(listId);
    if (!row || !list) return;
    const top = row.getBoundingClientRect().top - list.getBoundingClientRect().top;
    if (chosen === 0) list.scrollTop = 0;
    else if (top < 0) list.scrollTop += top;
    else if (top + row.offsetHeight > list.clientHeight) list.scrollTop += top + row.offsetHeight - list.clientHeight;
  }, [chosen, listId]);

  const open = (item: Item) => {
    remember(query);
    dialog.current?.close();
    // The search page reads its address when it appears, so an open one is loaded afresh.
    if (item.id === "all" && window.location.pathname === "/search/") window.location.assign(item.href);
    else router.push(item.href);
  };
  const changeScope = (next: Scope) => { setScope(next); setActive(0); };

  const keys = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (items.length) setActive((chosen + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (items[chosen]) open(items[chosen]);
    } else if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      changeScope(SCOPES[(SCOPES.findIndex((s) => s.value === scope) + 1) % SCOPES.length].value);
    }
  };

  return createPortal(
    <dialog
      ref={dialog}
      aria-label="কুরআন ও হাদিসে খুঁজুন"
      onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
      className="sheet mx-auto mt-[12dvh] max-h-[76dvh] open:flex w-[42.5rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-ln bg-sf p-0 text-ink shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] backdrop:bg-black/45"
    >
      <div className="flex items-center gap-3 border-b border-ln px-5">
        <Icon name="search" className="size-6 text-ac" />
        <input
          ref={box}
          role="combobox"
          aria-label="কুরআন ও হাদিসে খুঁজুন"
          aria-expanded={items.length > 0}
          aria-controls={listId}
          aria-activedescendant={items.length ? `${listId}-${chosen}` : undefined}
          autoComplete="off"
          maxLength={200}
          value={text}
          onChange={(e) => { type(e.target.value); setActive(0); }}
          onKeyDown={keys}
          placeholder="সূরা, আয়াত বা শব্দ লিখুন"
          className="quiet-focus h-16 min-w-0 flex-1 bg-transparent font-display text-lg"
        />
        <button type="button" onClick={() => dialog.current?.close()} aria-label="বন্ধ করুন" className="grid size-11 shrink-0 place-items-center">
          <kbd className="rounded-md border border-ln2 px-1.5 font-sans text-xs">Esc</kbd>
        </button>
      </div>
      <div className="px-3.5 pt-2.5"><Seg label="কোথায় খুঁজবেন" options={SCOPES} value={scope} onChange={changeScope} /></div>
      <p role="status" className="px-5 pt-2 text-[0.8125rem] text-ink2 empty:hidden">
        {failed ? "সার্চের ডেটা আনা যায়নি। ইন্টারনেট সংযোগ দেখুন।" : searching ? "খোঁজা হচ্ছে…" : query && items.length === 1 ? "কিছু পাওয়া যায়নি" : ""}
      </p>
      <ul id={listId} role="listbox" aria-label="ফলাফল" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3.5 py-2">
        {items.map((item, i) => (
          <li key={item.id} role="presentation">
            {item.group && item.group !== items[i - 1]?.group && <p aria-hidden className="px-1.5 pb-1 pt-2 text-xs text-ink2">{item.group}</p>}
            {/* The keyboard works from the box above; this is for the pointer. */}
            <div id={`${listId}-${i}`} role="option" aria-selected={i === chosen} onClick={() => open(item)} onMouseMove={() => setActive(i)} className={`min-h-11 cursor-pointer rounded-md border px-4 py-2.5 ${i === chosen ? "border-ac bg-tint ring-1 ring-ac" : "border-ln"}`}>
              {item.node}
            </div>
          </li>
        ))}
        {!query && <li role="presentation" className="px-2 py-6 text-center text-sm text-ink2">যেমন: ধৈর্য, ইয়াসিন, ২:২৫৫, আয়াতুল কুরসি</li>}
      </ul>
      <p aria-hidden className="hidden gap-4 border-t border-ln px-5 py-2.5 text-xs text-ink2 md:flex"><span>↑↓ বেছে নিন</span><span>↵ খুলুন</span><span>Tab কোথায় খুঁজবে বদলান</span></p>
    </dialog>,
    document.body,
  );
}
