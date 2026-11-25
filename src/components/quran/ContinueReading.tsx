"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { toBnDigits } from "@/lib/bn";
import { useLastRead } from "@/lib/quran/lastRead";

/** The gold card: back to where the reader stopped, or the start of the Quran. */
export function ContinueReading({ names }: { names: string[] }) {
  const place = useLastRead();
  return (
    <Link href={place ? `/quran/${place.s}/#a${place.a}` : "/quran/1/"} className="flex min-h-[4.625rem] items-center gap-3.5 rounded-[1.375rem] bg-gold px-4 py-3 text-on-gold">
      <span className="grid size-[2.875rem] shrink-0 place-items-center rounded-full bg-on-gold text-hero-accent">
        <Play aria-hidden className="size-5" fill="currentColor" />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.8125rem]">{place ? "যেখানে থেমেছিলেন" : "কুরআন পড়া শুরু করুন"}</span>
        <span className="block font-display text-lg font-semibold leading-snug">
          সূরা {names[(place?.s ?? 1) - 1]}{place && ` · আয়াত ${toBnDigits(place.a)}`}
        </span>
      </span>
    </Link>
  );
}
