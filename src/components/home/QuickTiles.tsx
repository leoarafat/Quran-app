import Link from "next/link";
import { BookOpen, PersonStanding, ScrollText, Sunrise } from "lucide-react";

const TILES = [
  { href: "/quran/", label: "কুরআন", icon: BookOpen },
  { href: "/amal/", label: "আমল", icon: Sunrise },
  { href: "/namaz/", label: "নামাজ শিক্ষা", icon: PersonStanding },
  { href: "/hadith/", label: "হাদিস", icon: ScrollText },
];

export function QuickTiles() {
  return (
    <ul className="grid grid-cols-4 gap-2 text-center text-[0.8125rem]">
      {TILES.map(({ href, label, icon: Icon }) => (
        <li key={href}>
          <Link href={href} className="flex flex-col items-center gap-[0.4375rem]">
            <span className="grid size-[3.875rem] place-items-center rounded-t-[1.9375rem] rounded-b-[1.125rem] border border-line-strong bg-surface text-accent">
              <Icon aria-hidden className="size-[1.625rem]" strokeWidth={1.6} />
            </span>
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
