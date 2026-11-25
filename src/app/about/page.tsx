import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { toBnDigits } from "@/lib/bn";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "উৎস ও শর্ত" };

export default function AboutPage() {
  const { sources } = getIndex();
  const card = "rounded-2xl border border-line bg-surface p-4";
  const link = "font-semibold text-brand underline";
  return (
    <>
      <PageHeader title="উৎস ও শর্ত" subtitle="কোন লেখা কোথা থেকে নেওয়া" />
      <div className="max-w-2xl space-y-4">
        <section className={card}>
          <h2 className="font-bold">আরবি কুরআন</h2>
          <p lang="en">{sources.arabic.name}, {sources.arabic.license}</p>
          <p>লেখা হুবহু রাখা হয়েছে; শুধু সূরার শুরুর বিসমিল্লাহ আলাদা লাইনে দেখানো হয়। হালনাগাদ: <a className={link} href={sources.arabic.url}>tanzil.net</a></p>
          <p><a className={link} href="/data/quran/TANZIL-NOTICE.txt">সম্পূর্ণ কপিরাইট নোটিস</a></p>
        </section>
        <section className={card}>
          <h2 className="font-bold">{sources.translation.name}</h2>
          <p>প্রকাশক: {sources.translation.publisher} · ভার্সন <span lang="en">{sources.translation.version}</span> · সংগ্রহ: {toBnDigits(sources.translation.fetched)}</p>
          <p>অনুবাদ ও টীকায় কোনো পরিবর্তন করা হয়নি। <a className={link} href={sources.translation.url}>মূল পাতা</a></p>
        </section>
        <section className={card}>
          <h2 className="font-bold">বাংলা উচ্চারণ</h2>
          <p>আরবি লেখার হরকত ও তাজবিদের কিছু নিয়ম ধরে এই অ্যাপের নিজস্ব প্রোগ্রাম দিয়ে তৈরি। আয়াতের শেষে থামলে যেভাবে পড়া হয় সেভাবে লেখা। ক্বারীর যাচাই এখনো বাকি।</p>
          <p>ح ও ه দুটিই “হ”; س, ص ও ش যথাক্রমে “স, স, শ”; ذ, ز ও ظ “য”; ت ও ط “ত”; د ও ض “দ”; ق ও ك “ক”। ঠিক ধ্বনি শিখতে তিলাওয়াত শুনুন বা একজন ক্বারীর সাহায্য নিন।</p>
        </section>
        <section className={card}>
          <h2 className="font-bold">তিলাওয়াত</h2>
          <p>অডিও <a className={link} href="https://everyayah.com">everyayah.com</a> থেকে সরাসরি চালানো হয়।</p>
        </section>
        <section className={card}>
          <h2 className="font-bold">সূরার বাংলা নাম</h2>
          <p>এগুলো এই অ্যাপের জন্য সংকলিত, আলেমের যাচাই এখনো বাকি।</p>
        </section>
      </div>
    </>
  );
}
