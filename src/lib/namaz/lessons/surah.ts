import type { Lesson } from "../types";

export const surah: Lesson = {
  slug: "surah",
  title: "নামাজের সূরা",
  hint: "ফাতিহা ও ছোট সূরা, অডিওসহ",
  intro: "প্রথমে সূরা ফাতিহা শিখুন, তারপর অন্তত দুটি ছোট সূরা (যেমন ইখলাস ও কাউসার)। আয়াতের অডিও শুনে মিলিয়ে পড়ুন; শুধু বাংলা উচ্চারণ দেখে আরবি পুরো শুদ্ধ হয় না।",
  sections: [
    { id: "fatiha", title: "সূরা ফাতিহা (প্রতি রাকাতে)", blocks: [{ kind: "ayat", passages: [[1, 1, 7]] }] },
    {
      id: "choto", title: "ছোট সূরা (ফাতিহার পরে)",
      blocks: [
        { kind: "note", text: "ফীল থেকে নাস, কুরআনের ক্রমে সাজানো। মুখস্থ করতে শেষের তিনটি (ইখলাস, ফালাক, নাস) দিয়ে শুরু করা সহজ।" },
        { kind: "ayat", passages: [[105, 1, 5], [106, 1, 4], [107, 1, 7], [108, 1, 3], [109, 1, 6], [110, 1, 3], [111, 1, 5], [112, 1, 4], [113, 1, 5], [114, 1, 6]] },
      ],
    },
  ],
};

export const doa: Lesson = {
  slug: "doa",
  title: "নামাজের সব দোয়া",
  hint: "সানা থেকে সালামের পরের যিকির",
  intro: "নামাজে যে ক্রমে লাগে, সেই ক্রমে সাজানো। আরবি লেখা HadeethEnc-এর হাদিস থেকে নেওয়া; কয়েকটিতে সব হরকত নেই, তাই উচ্চারণ আলেম বা ক্বারীর কাছে শুনে নিন।",
  sections: [
    { id: "vitore", title: "নামাজের ভেতরে", blocks: [{ kind: "duas", keys: ["takbir", "sana", "taawwuz", "ruku", "sami", "rabbana", "sujud", "jalsaShort", "jalsa", "tashahhud", "durud", "refuge", "salam"] }] },
    {
      id: "pore", title: "ফরজ সালামের পরে",
      blocks: [
        { kind: "list", ordered: true, items: ["৩ বার ইস্তিগফার, তারপর “আল্লাহুম্মা আনতাস সালাম…”", "“আল্লাহুম্মা আইন্নি…”", "৩৩ বার সুবহানাল্লাহ, ৩৩ বার আলহামদু লিল্লাহ, ৩৩ বা ৩৪ বার আল্লাহু আকবার", "আয়াতুল কুরসি (নিচে)"] },
        { kind: "duas", keys: ["istighfar", "antasSalam", "ainni", "subhanallah", "alhamdulillah", "takbir"] },
        { kind: "ayat", passages: [[2, 255, 255]] },
      ],
    },
  ],
};
