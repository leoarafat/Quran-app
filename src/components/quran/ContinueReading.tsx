"use client";

import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";
import { toBnDigits } from "@/lib/bn";
import { useLastRead } from "@/lib/quran/lastRead";

export function ContinueReading({ names }: { names: string[] }) {
  const place = useLastRead();
  if (!place) return null;
  return (
    <Link href={`/quran/${place.s}/#a${place.a}`} className="flex min-h-16 items-center gap-3 rounded-2xl border border-brand bg-surface px-4">
      <BookOpen aria-hidden className="size-6 text-brand" />
      <span className="flex-1">
        <span className="block text-sm text-muted">যেখানে থেমেছিলেন</span>
        <span className="block font-semibold">সূরা {names[place.s - 1]}, আয়াত {toBnDigits(place.a)}</span>
      </span>
      <ChevronRight aria-hidden className="size-5 text-muted" />
    </Link>
  );
}
