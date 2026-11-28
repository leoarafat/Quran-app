"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { toAsciiDigits, toBnDigits } from "@/lib/bn";
import type { BookChapter } from "@/lib/hadith/books";

const norm = (s: string) => s.normalize("NFD").toLowerCase();

/** The chapters of a collection: search by name, or go straight to a hadith number. */
export function ChapterList({ book, chapters }: { book: string; chapters: BookChapter[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const q = norm(query.trim());
  const number = Number(toAsciiDigits(query.trim()));
  const isNumber = Number.isInteger(number) && number > 0;
  const found = !q || isNumber ? chapters : chapters.filter((c) => norm(c.title).includes(q) || norm(c.english).includes(q));

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNumber) return;
    setError("");
    // Numbers do not run strictly chapter by chapter, so every chapter whose span holds it is looked into.
    for (const c of chapters.filter((x) => number >= x.first && number <= x.last)) {
      try {
        const rows = (await (await fetch(`/data/books/${book}/${c.id}.json`)).json()) as { n: number }[];
        if (rows.some((r) => r.n === number)) return router.push(`/hadith/full/${book}/${c.id}/#h-${number}`);
      } catch {
        return setError("খোঁজা যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।");
      }
    }
    setError(`${toBnDigits(number)} নম্বর হাদিস পাওয়া যায়নি।`);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={go} className="flex gap-2">
        <label className="flex min-h-13 min-w-0 flex-1 items-center gap-3 rounded-md border border-ln2 bg-sf px-4 text-ink2 focus-within:border-ac">
          <Icon name="search" className="size-5" />
          <input value={query} onChange={(e) => { setQuery(e.target.value); setError(""); }} aria-label="অধ্যায়ের নাম বা হাদিস নম্বর" placeholder="অধ্যায়ের নাম বা হাদিস নম্বর" className="quiet-focus min-w-0 flex-1 self-stretch bg-transparent text-ink" />
        </label>
        {isNumber && <button type="submit" className="min-h-13 shrink-0 rounded-md bg-ac px-5 font-semibold text-on-ac">যান</button>}
      </form>
      <p role="alert" className="text-sm font-semibold text-gt empty:hidden">{error}</p>
      <ol className="grid gap-2.5 lg:grid-cols-2">
        {found.map((c) => (
          <li key={c.id}>
            <Link href={`/hadith/full/${book}/${c.id}/`} prefetch={false} className="flex h-full items-center gap-3.5 rounded-md border border-ln bg-sf p-3.5 hover:border-ac">
              <span className="grid size-11 shrink-0 place-items-center rounded-[0.8125rem] bg-tint font-semibold text-on-tint">{toBnDigits(c.id)}</span>
              <span className="min-w-0 flex-1 leading-snug">
                <span className="block font-semibold">{c.title}</span>
                <span className="block text-[0.8125rem] text-ink2">{toBnDigits(c.count)}টি হাদিস · {toBnDigits(c.first)} থেকে</span>
              </span>
              <Icon name="chev" className="size-5 shrink-0 text-ink2" />
            </Link>
          </li>
        ))}
      </ol>
      {found.length === 0 && <p className="text-center text-ink2">এই নামে অধ্যায় পাওয়া যায়নি।</p>}
    </div>
  );
}
