/** One choice out of a few. */
export function Seg<T extends string>({ label, options, value, onChange, className = "" }: {
  label: string;
  options: readonly { value: T; text: string }[];
  /** null when the current state matches none of the options */
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={`flex gap-0.5 rounded-xl bg-ln p-[3px] ${className}`}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)} className={`min-h-11 min-w-0 flex-1 rounded-[0.625rem] px-1.5 text-sm leading-tight ${value === o.value ? "bg-ac font-semibold text-on-ac shadow-card" : "text-ink2 hover:bg-sf hover:text-ink"}`}>
          {o.text}
        </button>
      ))}
    </div>
  );
}
