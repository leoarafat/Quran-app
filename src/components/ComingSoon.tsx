export function ComingSoon({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md rounded-t-[10rem] rounded-b-3xl border border-line bg-surface px-8 pb-9 pt-14 text-center">
      <span aria-hidden className="mx-auto mb-4 block size-3 rotate-45 bg-gold" />
      <p className="mb-2 font-display text-lg font-semibold text-accent">এই অংশ তৈরি হচ্ছে</p>
      <p className="text-muted">{children}</p>
    </div>
  );
}
