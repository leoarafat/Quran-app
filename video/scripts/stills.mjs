// One still per scene (near its end, when everything is on screen) for checking the design.
// Usage: node scripts/stills.mjs <outDir> [sceneId …]
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { readFileSync } from "node:fs";

const [, , out, ...only] = process.argv;
const serveUrl = await bundle({ entryPoint: new URL("../src/index.ts", import.meta.url).pathname });
const puppeteerInstance = await openBrowser("chrome");
for (const id of ["eid", "janaza"]) {
  const { scenes } = JSON.parse(readFileSync(new URL(`../src/data/timeline.${id}.json`, import.meta.url)));
  const composition = await selectComposition({ serveUrl, id, puppeteerInstance });
  for (const scene of scenes.filter((s) => !only.length || only.includes(s.id))) {
    await renderStill({ serveUrl, composition, puppeteerInstance, frame: scene.from + scene.dur - 22, output: `${out}/${scene.id}.jpg`, imageFormat: "jpeg", scale: 0.5 });
    console.log(scene.id);
  }
}
await puppeteerInstance.close({ silent: true });
