/** A whole row that switches one thing on or off. */
export function Toggle({ label, hint, checked, onChange, disabled }: { label: string; hint?: string; checked: boolean; onChange: (next: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className="flex min-h-12 w-full items-center justify-between gap-3 text-left disabled:opacity-45">
      <span className="min-w-0">
        <span className="block">{label}</span>
        {hint && <span className="block text-[0.8125rem] leading-snug text-ink2">{hint}</span>}
      </span>
      <span aria-hidden="true" className={`relative h-7 w-[2.875rem] shrink-0 rounded-full ${checked ? "bg-ac" : "bg-ln2"}`}>
        <span className={`absolute top-[3px] size-[1.375rem] rounded-full bg-white shadow transition-[left] duration-150 ${checked ? "left-[1.3125rem]" : "left-[3px]"}`} />
      </span>
    </button>
  );
}
