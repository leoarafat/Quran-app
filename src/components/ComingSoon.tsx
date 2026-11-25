export function ComingSoon({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center">
      <p className="mb-1 font-semibold text-accent">এই অংশ তৈরি হচ্ছে</p>
      <p className="text-muted">{children}</p>
    </div>
  );
}
