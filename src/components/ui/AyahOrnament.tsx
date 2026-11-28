/** The eight-pointed ayah mark of the design system: two squares and a number. */
export function AyahOrnament({ label, className = "size-8", text = "text-xs" }: { /** Bangla digits; empty when numbers are hidden */ label: string; className?: string; text?: string }) {
  return (
    <span aria-hidden="true" className={`relative inline-grid shrink-0 place-items-center text-ac ${className}`}>
      <svg viewBox="0 0 40 40" className="absolute inset-0 size-full" fill="none" stroke="currentColor" strokeWidth={1.3}>
        <rect x="8" y="8" width="24" height="24" rx="3" />
        <rect x="8" y="8" width="24" height="24" rx="3" transform="rotate(45 20 20)" />
      </svg>
      <span className={`relative font-sans font-semibold leading-none tabular-nums text-ink ${text}`}>{label}</span>
    </span>
  );
}
