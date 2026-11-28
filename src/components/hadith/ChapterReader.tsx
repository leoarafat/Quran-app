"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import { toBnDigits } from "@/lib/bn";

type Row = { n: number; t: string; bn?: number[] };
const PAGE = 20;

/** The hadith number asked for in the address, as in #h-1521. */
const asked = () => Number(/^#h-([\d.]+)$/.exec(window.location.hash)?.[1] ?? 0);

/** One chapter, loaded when opened and shown a screenful at a time, so a long chapter stays light. */
export function ChapterReader({ book, chapter, title }: { book: string; chapter: number; /** "সহিহ বুখারী" */ title: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [target, setTarget] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch(`/data/books/${book}/${chapter}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<Row[]>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!alive) return;
        const at = data.findIndex((r) => r.n === asked());
        if (at >= 0) { setLimit(Math.ceil((at + 1) / PAGE) * PAGE); setTarget(data[at].n); }
        setRows(data);
      })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [book, chapter]);

  useEffect(() => {
    if (target) document.getElementById(`h-${target}`)?.scrollIntoView({ block: "start" });
  }, [target]);

  if (failed) return <p role="alert" className="rounded-md border border-ln bg-sf p-4">হাদিসগুলো আনা যায়নি। ইন্টারনেট দেখে পাতাটি আবার খুলুন।</p>;
  if (!rows) return <div className="space-y-3"><Skeleton className="h-40 !rounded-2xl" /><Skeleton className="h-40 !rounded-2xl" /></div>;

  const copy = async (row: Row) => {
    try {
      await navigator.clipboard.writeText(`${row.t}\n\n${title} ${toBnDigits(row.n)}`);
      showToast("কপি হয়েছে");
    } catch {
      showToast("কপি করা যায়নি");
    }
  };

  return (
    <div className="space-y-3">
      <ol className="space-y-3">
        {rows.slice(0, limit).map((row) => (
          <li key={row.n} id={`h-${row.n}`} className={`scroll-mt-20 rounded-md border bg-sf p-4 md:p-5 ${row.n === target ? "border-ac" : "border-ln"}`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="rounded-[0.625rem] bg-tint px-3 py-1 text-sm font-semibold text-on-tint">হাদিস {toBnDigits(row.n)}</h2>
              <button type="button" onClick={() => void copy(row)} aria-label={`হাদিস ${toBnDigits(row.n)} কপি করুন`} className="grid size-11 place-items-center rounded-xl text-ink2 hover:text-ac"><Icon name="copy" className="size-5" /></button>
            </div>
            <p lang="ar" dir="rtl" className="mt-2 text-right font-arabic leading-[2.3]" style={{ fontSize: "calc(1.5rem * var(--ar-scale))" }}>{row.t}</p>
            {row.bn && (
              <p className="mt-3 flex flex-wrap gap-x-3 border-t border-ln pt-1">
                {row.bn.map((id, i) => <Link key={id} href={`/hadith/${id}/`} prefetch={false} className="inline-flex min-h-11 items-center text-sm font-semibold text-ac underline">বাংলা অনুবাদ ও ব্যাখ্যা{row.bn!.length > 1 ? ` ${toBnDigits(i + 1)}` : ""} (যন্ত্রে মিলানো)</Link>)}
              </p>
            )}
          </li>
        ))}
      </ol>
      {rows.length > limit && <Chip className="w-full" onClick={() => setLimit((n) => n + PAGE)}>আরও দেখুন (বাকি {toBnDigits(rows.length - limit)}টি)</Chip>}
    </div>
  );
}
