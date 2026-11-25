# নামাজের ভিডিও (দুই ঈদ ও জানাজা)

Two Bangla lesson videos (1080×1350, burned-in subtitles, no music), built with [Remotion](https://remotion.dev).
The finished files are on Cloudflare R2; `src/lib/videos.json` in the app points at them.

## Rebuild
Run from this folder. `node_modules` needs Remotion 4.0.536 (`@remotion/cli`, `bundler`, `renderer`), React 19 and TypeScript;
`public/fonts/` holds the app's own @fontsource files.

1. `python3 scripts/extract-duas.py` – cuts the Arabic out of the verified HadeethEnc data → `src/data/duas.json`
2. `python3 scripts/stories.py` – **edit the words here** → `src/data/story.*.json`
3. `python scripts/tts.py` – voice, needs `pip install edge-tts` (bn-BD-Pradeep, ar-SA-Hamed); only changed sentences are redone
4. `python3 scripts/timeline.py` – timing and chapters
5. `node scripts/stills.mjs <folder>` – one picture per scene, to check layout
6. `npx remotion render src/index.ts eid out/eid.raw.mp4 --crf=20` (and `janaza`), then
   `ffmpeg -i out/eid.raw.mp4 -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 112k -movflags +faststart out/eid.mp4`
7. Posters: `npx remotion still src/index.ts poster-eid out/eid-poster.jpg`
8. `python3 scripts/publish.py <env file with R2_*> <public bucket URL>`

The steps and Bangla text are our own and await a scholar's review: see `docs/ALEM-REVIEW.md`, part ঙ.
