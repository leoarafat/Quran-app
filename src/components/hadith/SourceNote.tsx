import { toBnDigits } from "@/lib/bn";
import type { HadithIndex } from "@/lib/hadith/types";

/** The publisher's terms ask for the source and version to be stated with the text. */
export function SourceNote({ meta }: { meta: HadithIndex["meta"] }) {
  return (
    <p className="text-center text-[0.8125rem] leading-relaxed text-muted">
      উৎস: <a className="text-accent underline" href={meta.url}>{meta.publisher}</a> বাংলা ডেটা, ফাইলের তারিখ {toBnDigits(meta.fileDate)}
      {meta.version ? ` · ভার্সন ${meta.version}` : " · প্রকাশকের ফাইলে ভার্সন নম্বর উল্লেখ নেই"}। লেখায় কোনো পরিবর্তন করা হয়নি।
    </p>
  );
}
