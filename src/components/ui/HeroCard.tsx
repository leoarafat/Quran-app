import { useId } from "react";

/** The deep green card with the faint pattern, for a page's main figure. */
export function HeroCard({ label, className = "", children }: { label?: string; className?: string; children: React.ReactNode }) {
  const pattern = useId();
  return (
    <section aria-label={label} className={`on-deep relative overflow-hidden rounded-lg bg-hero p-5 text-on-hero shadow-[0_20px_40px_-20px_rgba(6,19,14,0.6)] ${className}`}>
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full opacity-5">
        <defs>
          <pattern id={pattern} width="44" height="44" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#fff"><rect x="10" y="10" width="24" height="24" /><rect x="10" y="10" width="24" height="24" transform="rotate(45 22 22)" /></g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${pattern})`} />
      </svg>
      <div className="relative">{children}</div>
    </section>
  );
}
