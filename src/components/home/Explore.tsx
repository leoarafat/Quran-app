import Link from "next/link";
import { DeedsLeft } from "@/components/home/MySnapshot";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { toBnDigits } from "@/lib/bn";
import { FEATURE_GROUPS } from "@/lib/features";

/** The second line under each name, by address. Names and icons come from FEATURE_GROUPS. */
const LINES: Record<string, string> = {
  "/quran/": "বাংলা অর্থ ও উচ্চারণসহ", "/bookmarks/": "আয়াত, হাদিস ও নোট", "/hadith/": "সূত্র ও ব্যাখ্যাসহ", "/amal/khatm/": "প্রতিদিনের লক্ষ্য", "/arabic/": "হরফ থেকে শব্দ",
};
const SHORT: Record<string, string> = { "/calendar/": "হিজরি", "/zakat/": "যাকাত", "/data/": "আমার ডেটা" };

const [reading, deeds, tools] = FEATURE_GROUPS;
const pages = (items: typeof tools.items) => items.flatMap((f) => (f.href ? [{ ...f, href: f.href }] : []));
/** The rail's order on the phone design; any tool not listed here still appears, after these. */
const RAIL = ["/qibla/", "/tasbih/", "/calendar/", "/prayer-times/", "/zakat/", "/hajj/", "/quiz/", "/data/"];
const place = (href: string) => (RAIL.indexOf(href) + 1 || RAIL.length + 1);

const named = (href: string) => pages(deeds.items).find((f) => f.href === href)!;

const title = "font-display text-xl font-semibold";

function Quick() {
  const tile = "flex h-28 shrink-0 flex-col justify-between rounded-md p-3.5 font-display text-[1.0625rem] font-semibold leading-snug";
  return (
    <ul className="rail -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
      <li><Link href="/quran/" className={`${tile} w-[8.25rem] bg-tint text-on-tint`}><Icon name="quran" className="size-7" /><span>কুরআন<span className="block font-sans text-xs font-normal">{toBnDigits(114)} সূরা</span></span></Link></li>
      <li><Link href="/amal/" className={`${tile} w-28 border border-ln bg-sf`}><Icon name="deeds" className="size-7 text-ac" />আমল</Link></li>
      <li><Link href="/namaz/" className={`${tile} w-[8.25rem] border border-ln bg-sf`}><Icon name="mosque" className="size-7 text-ac" />নামাজ শিক্ষা</Link></li>
      <li><Link href="/hadith/" className={`${tile} w-28 bg-gold-soft text-on-gold-soft`}><Icon name="hadith" className="size-7" />হাদিস</Link></li>
    </ul>
  );
}

export { Quick };

/** Phones: a list, a block layout and a rail, as on the phone design. */
export function ExploreSmall() {
  return (
    <div className="space-y-7 md:hidden">
      <section aria-labelledby="x-reading">
        <h2 id="x-reading" className={`${title} mb-1.5`}>{reading.title}</h2>
        <ul className="rounded-md border border-ln bg-sf px-4 py-1 shadow-card">
          {pages(reading.items).map((f) => (
            <li key={f.href} className="border-b border-ln last:border-0">
              <Link href={f.href} className="flex min-h-14 items-center gap-3.5 py-1.5">
                <Icon name={f.href === "/arabic/" ? "note" : f.icon} className="size-6 text-ac" />
                <span className="min-w-0 flex-1"><span className="block font-semibold">{f.title === "হাদিস" ? "হাদিস ও ব্যাখ্যা" : f.title}</span><span className="block text-[0.8125rem] leading-snug text-ink2">{LINES[f.href]}</span></span>
                <Icon name="chev" className="size-6 text-ink2" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="x-deeds" className="space-y-3">
        <h2 id="x-deeds" className={title}>{deeds.title}</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/amal/daily/" className="on-deep row-span-2 flex min-h-44 flex-col justify-between gap-3 rounded-md bg-hero p-4 text-on-hero">
            <Icon name="deeds" className="size-7 text-hero-accent" />
            <span><span className="block font-display text-[1.1875rem] font-semibold leading-normal">দৈনিক আমল</span><span className="block text-[0.8125rem] text-hero-muted"><DeedsLeft /></span></span>
          </Link>
          {([["/amal/after-salah/", "নামাজের পর", "clock"], ["/namaz/", "নামাজ শিক্ষা", "mosque"]] as const).map(([href, label, icon]) => (
            <Link key={href} href={href} className="flex flex-col gap-1.5 rounded-md border border-ln bg-sf p-3.5 shadow-card"><Icon name={icon} className="size-6 text-ac" /><b className="text-[0.9375rem] leading-normal">{label}</b></Link>
          ))}
        </div>
        <ul className="flex flex-wrap gap-2">
          {["/amal/", "/ramadan/", "/prophets/"].map((href) => <li key={href}><Chip href={href}>{named(href).title}</Chip></li>)}
        </ul>
      </section>

      <section aria-labelledby="x-tools" className="space-y-3">
        <h2 id="x-tools" className={title}>{tools.title}</h2>
        <ul className="rail -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {pages(tools.items).filter((f) => f.href !== "/me/").sort((a, b) => place(a.href) - place(b.href)).map((f) => (
            <li key={f.href} className="w-[4.75rem] shrink-0">
              <Link href={f.href} className="flex flex-col items-center gap-2 text-center text-[0.8125rem] leading-snug">
                <span className="grid size-[3.75rem] place-items-center rounded-[1.25rem] bg-tint text-on-tint"><Icon name={f.icon} className="size-7" /></span>
                {SHORT[f.href] ?? f.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/** Tablets: one compact card a group, as on the tablet design. Every page stays linked. */
export function ExploreTablet() {
  return (
    <div className="hidden grid-cols-2 gap-5 md:grid xl:hidden">
      {FEATURE_GROUPS.map((group, i) => (
        <section key={group.title} aria-labelledby={`x-tab-${i}`} className={`rounded-md border border-ln bg-sf px-4.5 pb-1.5 pt-4 shadow-card ${i === 2 ? "col-span-2" : ""}`}>
          <h2 id={`x-tab-${i}`} className="font-display text-[1.0625rem] font-semibold">{group.title}</h2>
          <ul className="flex flex-wrap gap-x-4">
            {pages(group.items).map((f) => (
              <li key={f.href}><Link href={f.href} className="flex min-h-11 items-center text-sm text-ink2 hover:text-ink hover:underline">{f.title}</Link></li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Wide screens: three lists side by side, with every page of each group. */
export function ExploreWide() {
  return (
    <div className="hidden grid-cols-3 gap-5 xl:grid">
      {FEATURE_GROUPS.map((group, i) => (
        <section key={group.title} aria-label={group.title} className={`rounded-[1.25rem] p-5 ${i === 1 ? "on-deep bg-hero text-on-hero" : "border border-ln bg-sf"}`}>
          <h2 className="mb-1.5 font-display text-lg font-semibold">{group.title}</h2>
          <ul>
            {pages(group.items).map((f) => (
              <li key={f.href} className={`border-t ${i === 1 ? "border-white/15" : "border-ln"}`}>
                <Link href={f.href} className="flex min-h-11 items-center justify-between gap-2 text-[0.9375rem] hover:underline">{f.title}<Icon name="chev" className="size-[1.125rem]" /></Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
