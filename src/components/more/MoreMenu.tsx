"use client";

import Link from "next/link";
import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon, type IconName } from "@/components/ui/Icon";
import { FEATURE_GROUPS, type Feature } from "@/lib/features";
import { foldName } from "@/lib/quran/find";
import { findPages } from "@/lib/search/features";
import { showWelcome } from "@/lib/welcome";

type Tile = { title: string; icon: IconName; href: string; hint: string; badge?: Feature["badge"]; onClick?: () => void };

const [reading, deeds, tools] = FEATURE_GROUPS;
const live = (items: Feature[]): Tile[] => items.flatMap((f) => (f.href ? [{ ...f, href: f.href }] : []));
const LEARN = "/arabic/";

/** The first row's order on the design. */
const READING_ORDER = ["/quran/", "/hadith/", "/bookmarks/", "/amal/khatm/"];

/** The five groups of the design. Every feature of the app is in exactly one. */
export const MENU: { title: string; tiles: Tile[] }[] = [
  { title: reading.title, tiles: live(reading.items).filter((t) => t.href !== LEARN).sort((a, b) => READING_ORDER.indexOf(a.href) - READING_ORDER.indexOf(b.href)) },
  { title: deeds.title, tiles: live(deeds.items) },
  { title: tools.title, tiles: live(tools.items) },
  { title: "শিখুন", tiles: live(reading.items).filter((t) => t.href === LEARN) },
  {
    title: "অ্যাপ",
    tiles: [
      { title: "সেটিংস", icon: "settings", href: "/settings/", hint: "থিম ফন্ট সাইজ" },
      { title: "অ্যাপ ইনস্টল ও অফলাইন", icon: "phone", href: "/offline/", hint: "ডাউনলোড" },
      { title: "উৎস ও শর্ত", icon: "info", href: "/about/", hint: "অনুবাদ লাইসেন্স" },
      { title: "স্বাগতম পাতা", icon: "moon", href: "/", hint: "ফজর", onClick: showWelcome },
    ],
  },
];

export function MoreMenu() {
  const [query, setQuery] = useState("");
  const q = foldName(query);
  const groups = MENU.map((g) => ({ ...g, tiles: q ? g.tiles.filter((t) => foldName(`${t.title} ${t.hint}`).includes(q)) : g.tiles })).filter((g) => g.tiles.length);
  const shown = new Set(groups.flatMap((g) => g.tiles.map((t) => t.href)));
  // Pages that have no tile of their own, such as a single lesson.
  const extra = findPages(query, 6).filter((p) => !shown.has(p.href));

  return (
    <div className="space-y-6">
      <label className="flex min-h-12 items-center gap-3 rounded-md border border-ln2 bg-sf px-4 text-ink2 focus-within:border-ac lg:max-w-md">
        <Icon name="search" className="size-5" />
        <input type="search" aria-label="ফিচার খুঁজুন" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ফিচার খুঁজুন" className="quiet-focus min-w-0 flex-1 bg-transparent text-ink" />
      </label>

      {groups.map((group) => (
        <section key={group.title} aria-label={group.title}>
          <h2 className="mb-2.5 font-display text-base font-semibold text-ink2">{group.title}</h2>
          <ul className="grid grid-cols-3 gap-2.5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {group.tiles.map((t) => (
              <li key={t.title}>
                <Link href={t.href} onClick={t.onClick} className="flex h-full min-h-[5.25rem] flex-col items-center justify-center gap-1.5 rounded-md border border-ln bg-sf px-1.5 py-3 text-center shadow-card hover:border-ac">
                  <Icon name={t.icon} className="size-6 text-ac" />
                  <span className="text-[0.8125rem] font-semibold leading-snug">{t.title}</span>
                  {/* Honest about pages that still lack something. */}
                  {t.badge && <span className="rounded-full bg-gs px-2 text-[0.6875rem] leading-5 text-ink">{t.badge}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {extra.length > 0 && (
        <section aria-label="আরও পাতা">
          <h2 className="mb-2.5 font-display text-base font-semibold text-ink2">আরও পাতা</h2>
          <ul className="flex flex-wrap gap-2">{extra.map((p) => <li key={p.href}><Chip href={p.href}>{p.title}</Chip></li>)}</ul>
        </section>
      )}
      {groups.length === 0 && extra.length === 0 && <EmptyState icon="search" title="কোনো ফিচার পাওয়া যায়নি">অন্য শব্দ লিখে দেখুন।</EmptyState>}
    </div>
  );
}
