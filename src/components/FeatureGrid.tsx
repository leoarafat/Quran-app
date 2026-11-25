import Link from "next/link";
import { FEATURE_GROUPS, type Feature } from "@/lib/features";

function Tile({ title, hint, icon: Icon, href, badge }: Feature) {
  const body = (
    <>
      <span className="grid size-11 shrink-0 place-items-center rounded-t-[1.5rem] rounded-b-xl border border-line-strong text-accent">
        <Icon aria-hidden className="size-6" />
      </span>
      <span className="contents lg:flex lg:min-w-0 lg:flex-col lg:items-start">
        <span className="font-display font-semibold leading-snug">{title}</span>
        <span className="text-sm leading-snug text-muted">{hint}</span>
        {(badge || !href) && <span className="mt-auto rounded-full bg-accent-soft px-2 text-xs text-accent lg:mt-1">{href ? badge : "শীঘ্রই"}</span>}
      </span>
    </>
  );
  const base = "flex h-full flex-col items-center gap-1.5 rounded-[1.375rem] border border-line bg-surface p-3 text-center lg:flex-row lg:gap-3.5 lg:p-4 lg:text-left";
  return href ? (
    <Link href={href} className={`${base} transition-colors hover:border-brand hover:bg-active`}>{body}</Link>
  ) : (
    <div className={base}>{body}</div>
  );
}

/** `compact` is for a narrower column, such as beside the home page's prayer card. */
export function FeatureGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-6">
      {FEATURE_GROUPS.map((group) => (
        <section key={group.title}>
          <h2 className="mb-3 font-display text-lg font-semibold">{group.title}</h2>
          <ul className={`grid grid-cols-2 gap-3 min-[22.5rem]:grid-cols-3 md:grid-cols-4 ${compact ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"}`}>
            {group.items.map((f) => (
              <li key={f.title}><Tile {...f} /></li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
