/** What a reader must know about the Arabic collections. */
export function FullNote({ source }: { source: string }) {
  return (
    <p className="text-center text-[0.8125rem] leading-relaxed text-ink2">
      আরবি পাঠ: <a className="text-gt underline" href="https://github.com/fawazahmed0/hadith-api">fawazahmed0/hadith-api</a> {source.includes("Unlicense") && "(Unlicense)"}। লেখায় পরিবর্তন করা হয়নি। নম্বর এই ডিজিটাল সংস্করণের; ছাপা বইয়ের নম্বরের সাথে সব জায়গায় নাও মিলতে পারে। অধ্যায়ের বাংলা নাম আমাদের অনুবাদ। আলেমের যাচাই বাকি।
    </p>
  );
}
