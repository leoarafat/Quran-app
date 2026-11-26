// Theme following the phone, reduced motion, copy, the bookmark backup file, the offline Quran
// pack and offline audio, in a headless Chrome. Run after `npm run build`:
//   node scripts/dev/check-features.mjs "$PWD/out" /some/temp/folder
// everyayah.com is blocked; recitation files are stand-in bytes, so nothing is downloaded.
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const [outDir, scratch] = process.argv.slice(2);
const BASE = "http://127.0.0.1:5377";
const DEBUG = 9378;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(join(scratch, "feat-prof-"));
const downloads = join(profile, "dl");
mkdirSync(downloads);
const server = spawn("python3", ["-I", join(dirname(fileURLToPath(import.meta.url)), "static-server.py"), outDir], { stdio: "ignore" });
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--disable-gpu", "--no-first-run", `--remote-debugging-port=${DEBUG}`, `--user-data-dir=${profile}`,
  "--host-resolver-rules=MAP everyayah.com 127.0.0.1:1", "--window-size=500,900", "about:blank",
], { stdio: "ignore" });

try {
  let target;
  for (let i = 0; i < 60 && !target; i++) {
    await wait(300);
    target = await fetch(`http://127.0.0.1:${DEBUG}/json/list`).then((r) => r.json()).then((l) => l.find((t) => t.type === "page")).catch(() => null);
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0, stubbed = 0;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
    if (d.method === "Fetch.requestPaused") {
      stubbed++;
      send("Fetch.fulfillRequest", { requestId: d.params.requestId, responseCode: 200, responseHeaders: [{ name: "Content-Type", value: "audio/mpeg" }, { name: "Access-Control-Allow-Origin", value: "*" }], body: Buffer.alloc(2048, 1).toString("base64") });
    }
  };
  const evaluate = async (body) => {
    const d = await send("Runtime.evaluate", { expression: `(async()=>{const wait=(ms)=>new Promise(r=>setTimeout(r,ms)); const q=(s)=>document.querySelector(s); const button=(t)=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim().startsWith(t)); ${body}})()`, awaitPromise: true, returnByValue: true, userGesture: true });
    return d.result?.exceptionDetails ? `ERR ${d.result.exceptionDetails.exception?.description?.slice(0, 300)}` : d.result?.result?.value;
  };
  const go = async (path, ms = 2500) => { await send("Page.navigate", { url: BASE + path }); await wait(ms); };
  const media = (features) => send("Emulation.setEmulatedMedia", { features });
  const report = (name, value) => console.log(name.padEnd(16), JSON.stringify(value));
  await send("Page.enable");
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });

  await media([{ name: "prefers-color-scheme", value: "light" }]);
  await go("/about/");
  await evaluate(`const d=new Date(); localStorage.setItem('noor.onboarded.v1','1'); localStorage.setItem('noor.welcome.v1', d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()); localStorage.setItem('noor.settings.v1', JSON.stringify({theme:'system'}))`);

  await go("/settings/");
  const theme = () => evaluate(`return document.documentElement.dataset.theme`);
  const seen = [await theme()];
  await media([{ name: "prefers-color-scheme", value: "dark" }]); await wait(500); seen.push(await theme());
  await media([{ name: "prefers-color-scheme", value: "light" }]); await wait(500); seen.push(await theme());
  report("system theme", seen);
  await evaluate(`localStorage.setItem('noor.settings.v1', JSON.stringify({theme:'paper'}))`);

  await media([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await go("/");
  report("reduced: tab", await evaluate(`const seen=[]; const o=document.startViewTransition.bind(document); document.startViewTransition=(a)=>{const t=o(a); t.ready.then(()=>seen.push(document.getAnimations().filter(x=>x.effect?.pseudoElement).map(x=>x.effect.pseudoElement+':'+x.animationName))).catch(()=>seen.push('skipped')); return t}; q('nav[aria-label="প্রধান মেনু"] a[href="/quran/"]').click(); await wait(1500); return {path:location.pathname, running:seen}`));
  await go("/quran/1/");
  report("reduced: sheet", await evaluate(`button('আয়াত ১').click(); await wait(400); return {open:!!q('dialog[open]'), animation:getComputedStyle(q('dialog[open]')).animationName, running:document.getAnimations().length}`));
  await media([]);

  await send("Browser.grantPermissions", { origin: BASE, permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] });
  await go("/quran/1/");
  report("copy", await evaluate(`q('#a2 button[aria-expanded]').click(); await wait(300); q('#a2 [aria-label$="কপি করুন"]').click(); await wait(600); const text=await navigator.clipboard.readText(); const data=await fetch('/data/quran/1.json').then(r=>r.json()); const a=data.ayahs[1]; return {toast:document.body.innerText.includes('কপি হয়েছে'), arabic:text.startsWith(a.ar), pron:text.includes(a.tr), meaning:text.includes(a.bn), ref:text.includes('১:২')}`));

  await send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloads });
  await evaluate(`localStorage.setItem('noor.bookmarks.v1', JSON.stringify({version:1,folders:[{id:'f1',name:'পরীক্ষা'}],items:[{s:2,a:255,folder:'f1',note:'নোট',created:1,updated:1}],hadiths:[]}))`);
  await go("/bookmarks/");
  await evaluate(`button('ব্যাকআপ নিন').click(); await wait(1500)`);
  const files = readdirSync(downloads).filter((f) => f.startsWith("noor-quran-")); // Chrome may drop files of its own here
  report("backup file", { files, content: files[0] ? JSON.parse(readFileSync(join(downloads, files[0]), "utf8")) : null });

  await go("/", 2000);
  report("worker", await evaluate(`return await Promise.race([navigator.serviceWorker.ready.then(()=>'ready'), wait(90000).then(()=>'timeout')])`));
  await go("/offline/", 3500);
  report("quran pack", await evaluate(`button('সেভ করুন').click(); for(let i=0;i<240;i++){await wait(1000); if(document.body.innerText.includes('পুরো কুরআন সেভ হয়েছে')) break;} const keys=await (await caches.open('noor-quran-offline')).keys(); const pack=await fetch('/offline-quran.json').then(r=>r.json()); return {done:document.body.innerText.includes('পুরো কুরআন সেভ হয়েছে'), saved:keys.length, listed:pack.urls.length}`));

  await send("Network.enable");
  await send("Network.setBypassServiceWorker", { bypass: true });
  await send("Fetch.enable", { patterns: [{ urlPattern: "https://everyayah.com/*" }] });
  report("audio save", await evaluate(`const s=document.querySelectorAll('select')[1]; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(s,'112'); s.dispatchEvent(new Event('change',{bubbles:true})); await wait(200); button('অডিও সেভ করুন').click(); await wait(5000); const keys=await (await caches.open('noor-audio')).keys(); return {files:keys.map(k=>k.url.split('/data/')[1]), message:[...document.querySelectorAll('[role=status]')].map(e=>e.textContent).filter(Boolean)}`));
  report("stand-ins", stubbed);
  await send("Fetch.disable");
  await send("Network.setBypassServiceWorker", { bypass: false });

  server.kill();
  await wait(1500);
  report("server stopped", await fetch(BASE).then(() => false, () => true));
  for (const path of ["/quran/36/", "/quran/114/"]) {
    await go(path, 4000);
    report("offline " + path, await evaluate(`const el=q('#main a, #main button'); return {title:document.title, ayahs:document.querySelectorAll('[data-ayah]').length, hydrated:!!el&&Object.keys(el).some(k=>k.startsWith('__react'))}`));
  }
  await go("/search/?q=" + encodeURIComponent("২:২৫৫"), 4000);
  report("offline search", await evaluate(`return document.querySelector('#main').innerText.includes('২৫৫')`));
  await go("/quran/112/", 3000);
  report("offline audio", await evaluate(`const u='https://everyayah.com/data/Alafasy_128kbps/112001.mp3'; const full=await fetch(u); const part=await fetch(u,{headers:{Range:'bytes=0-99'}}); return {full:full.status, bytes:(await full.arrayBuffer()).byteLength, range:part.status, rangeHeader:part.headers.get('Content-Range'), missing:await fetch('https://everyayah.com/data/Alafasy_128kbps/113001.mp3').then(r=>r.status,()=>'fails offline, as it should')}`));
  ws.close();
} finally {
  server.kill();
  chrome.kill();
  await wait(800);
  rmSync(profile, { recursive: true, force: true });
}
