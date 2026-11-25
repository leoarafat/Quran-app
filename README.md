# নূর কুরআন

মোবাইল-ফার্স্ট বাংলা কুরআন ওয়েব অ্যাপ। পরিকল্পনা: `docs/PLAN.md` · উৎস ও লাইসেন্স: `docs/DATA-SOURCES.md` · অগ্রগতি: `docs/PROGRESS.md`

```bash
npm install
npm run dev        # ডেভেলপমেন্ট
npm test           # ডেটা ও লজিক টেস্ট
npm run typecheck && npm run lint
npm run build      # ডেটা যাচাই করে out/ ফোল্ডারে স্ট্যাটিক সাইট বানায়
```

`data/raw/` এর ফাইল কখনো হাতে বদলাবেন না। `public/data/` স্ক্রিপ্টে তৈরি হয় (`npm run data:build`)।
