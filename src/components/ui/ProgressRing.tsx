export function ProgressRing({ value, label, size = 84, stroke = 7, children }: { /** 0..1 */ value: number; /** spoken description */ label: string; size?: number; stroke?: number; children?: React.ReactNode }) {
  const radius = (size - stroke * 2) / 2;
  const length = 2 * Math.PI * radius;
  const share = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  const circle = { cx: size / 2, cy: size / 2, r: radius, fill: "none", strokeWidth: stroke };
  return (
    <span role="img" aria-label={label} className="relative inline-grid shrink-0 place-items-center" style={{ width: `${size / 16}rem`, height: `${size / 16}rem` }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 size-full -rotate-90">
        <circle {...circle} className="stroke-ln" />
        {share > 0 && <circle {...circle} className="stroke-gd transition-[stroke-dasharray] duration-[600ms]" strokeLinecap="round" strokeDasharray={`${length * share} ${length}`} />}
      </svg>
      <span aria-hidden="true" className="relative flex flex-col items-center leading-tight">{children}</span>
    </span>
  );
}

export function ProgressBar({ value, className = "" }: { /** 0..1 */ value: number; className?: string }) {
  return (
    <span aria-hidden="true" className={`block h-1.5 overflow-hidden rounded-full bg-ln ${className}`}>
      <span className="block h-full rounded-full bg-gd" style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
    </span>
  );
}
