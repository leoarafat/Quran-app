import type { Metadata } from "next";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { LinkList } from "@/components/ui/LinkList";
import { toBnDigits } from "@/lib/bn";
import { getHadithIndex } from "@/lib/hadith/server";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "উৎস ও শর্ত" };

export default function AboutPage() {
  const { sources } = getIndex();
  const hadith = getHadithIndex().index.meta;
  const card = "rounded-md border border-ln bg-sf p-4 shadow-card";
  const link = "font-semibold text-ac underline";
  return (
    <div className="mx-auto max-w-2xl">
      <ScreenHeader title="উৎস ও শর্ত" back={{ href: "/more/", label: "আরও পাতায় ফিরে যান" }} />
      <div className="space-y-4">
        <section className={card}>
          <p className="font-display text-xl font-bold">নূর কুরআন</p>
          <p className="text-sm text-ink2">কুরআন, হাদিস ও দৈনিক ইবাদতের বাংলা সঙ্গী। কোন লেখা কোথা থেকে নেওয়া, নিচে লেখা আছে।</p>
        </section>
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
          <h2 className="font-bold">হাদিস ও দোয়া</h2>
          <p><a className={link} href="https://hadeethenc.com/bn/home">HadeethEnc.com</a>-এর অফিসিয়াল বাংলা ডেটা, ফাইলের তারিখ {toBnDigits(hadith.fileDate)}। ফাইলে অনুবাদের ভার্সন নম্বর উল্লেখ নেই।</p>
          <p>লেখায় পরিবর্তন করা হয়নি। দুর্বল বা অস্পষ্ট মানের বর্ণনা দেখানো হয় না। বুখারীর নম্বর যন্ত্রে আলাদা সংকলনের সাথে মিলিয়ে পাওয়া। এই মিলানো আলেমের যাচাই নয়।</p>
        </section>
        <section className={card}>
          <h2 className="font-bold">তিলাওয়াত</h2>
          <p>অডিও <a className={link} href="https://everyayah.com">everyayah.com</a> থেকে সরাসরি চালানো হয়।</p>
        </section>
        <section className={card}>
          <h2 className="font-bold">সূরার বাংলা নাম</h2>
          <p>এগুলো এই অ্যাপের জন্য সংকলিত, আলেমের যাচাই এখনো বাকি।</p>
        </section>
        <section className={card}>
          <h2 className="font-bold">গোপনীয়তা</h2>
          <p>বুকমার্ক, নোট, আমলের খাতা ও সেটিংস শুধু আপনার ফোনের এই ব্রাউজারে থাকে। নামাজের সময়ের জন্য নেওয়া অবস্থান ফোনের বাইরে যায় না।</p>
        </section>
        <LinkList items={[{ href: "/data/", title: "আমার ডেটা", hint: "ব্যাকআপ, রিস্টোর ও মুছে ফেলা", icon: "lock" }, { href: "/offline/", title: "অ্যাপ ইনস্টল ও অফলাইন", icon: "download" }]} />
      </div>
    </div>
  );
}
