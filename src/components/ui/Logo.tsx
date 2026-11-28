/** The Noor Quran mark: two pages that make an open Quran and a mihrab arch, with the eight-pointed star of light. */
export function Logo({ className = "size-11", light = false, label }: { className?: string; /** cream square, for the green header */ light?: boolean; /** spoken name; without it the mark is decoration */ label?: string }) {
  const paper = light ? "#0F4C3A" : "#F5F7F4";
  return (
    <svg viewBox="0 0 120 120" className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <rect width="120" height="120" rx="30" fill={light ? "#F5F7F4" : "#0F4C3A"} />
      <path d="M57 100C46 92 34 90 24 92V56C24 38 40 26 57 16V30C45 38 36 47 36 58V80C44 80 51 82 57 86Z" fill={paper} />
      <path d="M63 100C74 92 86 90 96 92V56C96 38 80 26 63 16V30C75 38 84 47 84 58V80C76 80 69 82 63 86Z" fill={paper} />
      <g fill={light ? "#C4932F" : "#E3B65A"}>
        <rect x="49" y="47" width="22" height="22" />
        <rect x="49" y="47" width="22" height="22" transform="rotate(45 60 58)" />
      </g>
    </svg>
  );
}
