import Link from "next/link";
import { Icon, type IconName } from "./Icon";

export type LinkItem = { href: string; title: string; hint?: string; icon: IconName };

/** A card of rows that lead to other pages. */
export function LinkList({ items, className = "" }: { items: LinkItem[]; className?: string }) {
  return (
    <ul className={`rounded-md border border-ln bg-sf px-4 py-1 shadow-card ${className}`}>
      {items.map((item) => (
        <li key={item.href} className="border-b border-ln last:border-0">
          <Link href={item.href} className="flex min-h-15 items-center gap-3.5 py-1.5">
            <Icon name={item.icon} className="size-6 shrink-0 text-ac" />
            <span className="min-w-0 flex-1 leading-snug"><span className="block font-semibold">{item.title}</span>{item.hint && <span className="block text-[0.8125rem] text-ink2">{item.hint}</span>}</span>
            <Icon name="chev" className="size-5 shrink-0 text-ink2" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
