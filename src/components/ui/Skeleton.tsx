/** A placeholder with the size of what is coming, so nothing jumps when it arrives. */
export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return <span aria-hidden="true" className={`skeleton block rounded-lg ${className}`} />;
}
