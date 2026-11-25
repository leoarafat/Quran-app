// Loads the built site in a headless Chrome, stops the web server, and opens pages again.
// Run after `npm run build`:
//   node scripts/dev/check-offline.mjs "$PWD/out" "$PWD/scripts/dev/static-server.py" /some/temp/folder
// Expected: every listed page opens and is "hydrated", except /quran/36/ (never visited), which
// shows the no-connection page; the palette finds 2 options.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [outDir, serverScript, scratch] = process.argv.slice(2);
const BASE = "http://127.0.0.1:5377";
const DEBUG = 9377;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(join(scratch || tmpdir(), "offline-prof-"));

const server = spawn("python3", ["-I", serverScript, outDir], { stdio: "ignore" });
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--disable-gpu", "--no-first-run", `--remote-debugging-port=${DEBUG}`, `--user-data-dir=${profile}`, "--window-size=500,900", "about:blank",
], { stdio: "ignore" });

try {
  let target;
  for (let i = 0; i < 60 && !target; i++) {
    await wait(300);
    target = await fetch(`http://127.0.0.1:${DEBUG}/json/list`).then((r) => r.json()).then((l) => l.find((t) => t.type === "page")).catch(() => null);
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
  };
  const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async (expression) => {
    const d = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    return d.result?.exceptionDetails ? `ERR ${d.result.exceptionDetails.exception?.description?.slice(0, 200)}` : d.result?.result?.value;
  };
  const go = async (path, ms = 3500) => { await send("Page.navigate", { url: BASE + path }); await wait(ms); };
  await send("Page.enable");

  await go("/about/");
  await evaluate(`const d=new Date(); localStorage.setItem('noor.welcome.v1', d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()); 1`);
  await go("/", 2000);
  console.log("worker:", await evaluate(`Promise.race([navigator.serviceWorker.ready.then(()=>'ready'), new Promise(r=>setTimeout(()=>r('timeout'),90000))])`));
  await go("/", 4000);
  console.log("controlled:", await evaluate(`!!navigator.serviceWorker.controller`));
  await go("/quran/1/", 4000); // one surah is read while online

  server.kill();
  await wait(1500);
  console.log("server stopped:", await fetch(BASE).then(() => "no, still up", () => "yes"));

  const probe = `(()=>{const el=document.querySelector('#main a, #main button'); return JSON.stringify({title:document.title, hydrated: !!el && Object.keys(el).some(k=>k.startsWith('__react')), fonts:[...new Set([...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family))].join(), text:(document.querySelector('#main')||document.body).innerText.replace(/\\s+/g,' ').slice(0,60)})})()`;
  for (const path of ["/", "/quran/", "/search/", "/bookmarks/", "/settings/", "/more/", "/quran/1/", "/quran/36/"]) {
    await go(path);
    console.log(path, await evaluate(probe));
  }

  // The command palette, opened offline without having been opened online.
  await go("/more/");
  console.log("palette:", await evaluate(`(async()=>{window.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true})); await new Promise(r=>setTimeout(r,2500)); const i=document.querySelector('dialog[open] input'); if(!i) return 'did not open'; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,'\\u09e8:\\u09e8\\u09eb\\u09eb'); i.dispatchEvent(new Event('input',{bubbles:true})); await new Promise(r=>setTimeout(r,1500)); return document.querySelectorAll('dialog[open] [role=option]').length+' options'})()`));
  ws.close();
} finally {
  server.kill();
  chrome.kill();
  await wait(800);
  rmSync(profile, { recursive: true, force: true });
}
