// Our own ready-made plans. Each is only a range of the Quran and a number of days.
import type { Ref } from "./planner";

export type Template = { id: string; name: string; days: number; from: Ref; to: Ref; about: string };

const whole = { from: { s: 1, a: 1 }, to: { s: 114, a: 6 } };
const surahs = (a: number, b: number, lastAyah: number) => ({ from: { s: a, a: 1 }, to: { s: b, a: lastAyah } });

export const TEMPLATE_GROUPS: { title: string; items: Template[] }[] = [
  {
    title: "সম্পূর্ণ কুরআন তিলাওয়াত",
    items: [
      { id: "khatm-30", name: "এক মাসে কুরআন", days: 30, ...whole, about: "প্রতিদিন প্রায় ২০ পৃষ্ঠা। রমজান বা যে কোনো মাসে পুরো কুরআন পড়ে শেষ করার জন্য।" },
      { id: "khatm-60", name: "দুই মাসে কুরআন", days: 60, ...whole, about: "প্রতিদিন প্রায় ১০ পৃষ্ঠা।" },
      { id: "khatm-120", name: "চার মাসে কুরআন", days: 120, ...whole, about: "প্রতিদিন প্রায় ৫ পৃষ্ঠা। নিয়মিত অভ্যাস গড়ার জন্য।" },
      { id: "khatm-365", name: "এক বছরে কুরআন", days: 365, ...whole, about: "প্রতিদিন দুই পৃষ্ঠার কাছাকাছি। ব্যস্ততার মাঝেও চালিয়ে যাওয়া যায়।" },
    ],
  },
  {
    title: "অল্প অল্প করে, অর্থ বুঝে",
    items: [
      { id: "short-10", name: "শেষ দশ সূরা", days: 10, ...surahs(105, 114, 6), about: "সূরা ফীল থেকে নাস। প্রতিদিন অর্থসহ পড়ুন ও মুখস্থ ঝালিয়ে নিন।" },
      { id: "last-20", name: "শেষ ২০ সূরা", days: 20, ...surahs(95, 114, 6), about: "সূরা তীন থেকে নাস, অর্থ ও উচ্চারণ মিলিয়ে।" },
      { id: "amma", name: "আমপারা (৩০তম পারা)", days: 37, ...surahs(78, 114, 6), about: "৩০তম পারা ছোট ছোট অংশে, অর্থ বুঝে।" },
      { id: "tabarak", name: "তাবারাকা পারা (২৯তম)", days: 29, ...surahs(67, 77, 50), about: "সূরা মুলক থেকে মুরসালাত।" },
    ],
  },
  {
    title: "বিশেষ সূরা",
    items: [
      { id: "baqarah", name: "সূরা আল-বাকারা", days: 40, ...surahs(2, 2, 286), about: "দীর্ঘতম সূরাটি চল্লিশ দিনে।" },
      { id: "yusuf", name: "সূরা ইউসুফ", days: 7, ...surahs(12, 12, 111), about: "ইউসুফ আলাইহিস সালামের ঘটনা এক সপ্তাহে।" },
      { id: "kahf", name: "সূরা আল-কাহফ", days: 5, ...surahs(18, 18, 110), about: "পাঁচ দিনে অর্থ বুঝে পড়ুন।" },
    ],
  },
];
