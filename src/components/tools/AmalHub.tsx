"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon, type IconName } from "@/components/ui/Icon";
import { toBnDigits } from "@/lib/bn";

export type Group = { id: number; title: string; count: number };
type Props = { shortcuts: { href: string; title: string; icon: IconName }[]; quranDuas: number; topics: Group[]; manners: Group[]; children: React.ReactNode };

const norm = (s: string) => s.normalize("NFD").toLowerCase();

function Groups({ title, groups }: { title: string; groups: Group[] }) {
  if (groups.length === 0) return null;
  return (
    <section aria-label={title} className="space-y-2">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <ul className="rounded-md border border-ln bg-sf px-4 py-1 shadow-card md:grid md:grid-cols-2 md:gap-x-6">
        {groups.map((g) => (
          <li key={g.id} className="border-b border-ln last:border-0">
            <Link href={`/hadith/c/${g.id}/`} prefetch={false} className="flex h-full min-h-14 items-center gap-3 py-2">
              <span className="min-w-0 flex-1 font-semibold leading-snug">{g.title}</span>
              <span className="shrink-0 text-[0.8125rem] text-ink2">{toBnDigits(g.count)}টি</span>
              <Icon name="chev" className="size-5 shrink-0 text-ink2" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The search box narrows the groups of supplications; the rest of the page steps aside while typing. */
export function AmalHub({ shortcuts, quranDuas, topics, manners, children }: Props) {
  const [query, setQuery] = useState("");
  const q = norm(query.trim());
  const match = (list: Group[]) => (q ? list.filter((g) => norm(g.title).includes(q)) : list);
  const found = [match(topics), match(manners)];
  const quran = !q || norm("কুরআনের দোয়া রব্বানা").includes(q);

  return (
    <div className="space-y-4">
      <label className="flex min-h-13 items-center gap-3 rounded-md border border-ln2 bg-sf px-4 text-ink2 focus-within:border-ac">
        <Icon name="search" className="size-5" />
        <input type="search" aria-label="দোয়ার বিষয় খুঁজুন" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="দোয়ার বিষয় খুঁজুন" className="quiet-focus min-w-0 flex-1 self-stretch bg-transparent text-ink" />
      </label>

      {!q && (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {shortcuts.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="flex h-full min-h-14 items-center gap-3 rounded-md border border-ln bg-sf px-3.5 py-2 font-semibold leading-snug shadow-card">
                <Icon name={s.icon} className="size-6 shrink-0 text-ac" />{s.title}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {quran && (
        <Link href="/amal/quran/" className="flex min-h-18 items-center gap-3.5 rounded-md bg-tint px-4 py-3 text-on-tint">
          <Icon name="quran" className="size-7 shrink-0" />
          <span className="min-w-0 flex-1 leading-snug"><span className="block font-display text-lg font-semibold">কুরআনের দোয়া</span><span className="block text-[0.8125rem]">{toBnDigits(quranDuas)}টি দোয়া · আরবি, উচ্চারণ, অর্থ ও তিলাওয়াত</span></span>
          <Icon name="chev" className="size-5 shrink-0" />
        </Link>
      )}

      <Groups title="হাদিস থেকে দোয়া ও যিকির" groups={found[0]} />
      <Groups title="দৈনন্দিন আদব" groups={found[1]} />
      {!quran && found[0].length + found[1].length === 0 && <EmptyState icon="search" title="এই নামে কোনো বিষয় নেই">আয়াত বা হাদিসের ভেতরের শব্দ খুঁজতে নিচের “খুঁজুন” ট্যাবে যান।</EmptyState>}
      {!q && children}
    </div>
  );
}
