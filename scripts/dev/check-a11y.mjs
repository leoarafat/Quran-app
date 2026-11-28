// Our own accessibility pass in headless Chrome, with the static server already running:
//   node scripts/dev/check-a11y.mjs [theme ...]     (default: paper)
// Checks names of controls (and that they are in Bangla), headings, duplicate ids, text contrast,
// small targets, sideways scrolling, and that every Tab stop can be seen. It does not replace
// a real screen reader.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = "http://127.0.0.1:5377";
const themes = process.argv.slice(2).length ? process.argv.slice(2) : ["paper"];
const ROUTES = process.env.ROUTES ? process.env.ROUTES.split(",") : ["/", "/quran/", "/quran/1/", "/planner/", "/search/", "/bookmarks/", "/settings/", "/more/", "/prayer-times/", "/amal/", "/amal/daily/", "/amal/after-salah/", "/amal/khatm/", "/amal/quran/", "/amal/fasting/", "/ramadan/", "/tasbih/", "/qibla/", "/calendar/", "/hadith/", "/hadith/c/486/", "/namaz/", "/namaz/oju/", "/arabic/", "/prophets/", "/hajj/", "/zakat/", "/quiz/", "/me/", "/data/", "/about/", "/offline/"];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const PORT = 9379;
const profile = mkdtempSync(join(tmpdir(), "a11y-"));
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--disable-gpu", "--no-first-run", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });

function inspect() {
  const out = [];
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && el.checkVisibility({ visibilityProperty: true, opacityProperty: true }); };
  const srOnly = (el) => !!el.closest(".sr-only");
  const say = (el) => `<${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 60)}"> ${el.textContent.trim().slice(0, 40)}`;
  const nameOf = (el) => {
    const by = el.getAttribute("aria-labelledby");
    if (by) return by.split(" ").map((i) => document.getElementById(i)?.textContent ?? "").join(" ").trim();
    return (el.getAttribute("aria-label") || (el.labels?.length ? [...el.labels].map((l) => l.textContent).join(" ") : "") || (/^(input|select|textarea)$/i.test(el.tagName) ? "" : el.textContent) || el.querySelector("img[alt]")?.alt || el.querySelector("svg[aria-label]")?.getAttribute("aria-label") || el.getAttribute("title") || "").trim();
  };
  for (const el of document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=checkbox], [role=switch], summary")) {
    if (!visible(el)) continue;
    const name = nameOf(el);
    if (!name) out.push(`no name: ${say(el)}`);
    else if (/[a-z]{3}/i.test(el.getAttribute("aria-label") ?? "")) out.push(`label not in Bangla: ${el.getAttribute("aria-label")}`);
    const r = el.getBoundingClientRect();
    // Links inside running text are exempt, as are controls wrapped in a larger label.
    const inText = el.tagName === "A" && (getComputedStyle(el).display === "inline" || !!el.closest("p"));
    const box = el.closest("label")?.getBoundingClientRect() ?? r;
    if (!inText && !srOnly(el) && (box.height < 40 || box.width < 40)) out.push(`small target ${Math.round(box.width)}x${Math.round(box.height)}: ${say(el)}`);
  }
  for (const img of document.querySelectorAll("img:not([alt])")) out.push(`img without alt: ${img.src}`);
  const h1 = [...document.querySelectorAll("h1, [role=heading][aria-level='1']")].filter(visible).length;
  if (h1 !== 1) out.push(`${h1} visible level-1 headings`);
  const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
  for (const d of new Set(ids.filter((x, i) => ids.indexOf(x) !== i))) out.push(`duplicate id ${d}`);
  if (document.documentElement.lang !== "bn") out.push("page language is not bn");
  if (document.documentElement.scrollWidth > innerWidth) out.push(`sideways scroll ${document.documentElement.scrollWidth}`);

  // Contrast of every piece of text against the first solid colour behind it.
  const cv = document.createElement("canvas"); cv.width = cv.height = 1;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  const rgba = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = "#000"; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const over = (top, under) => [0, 1, 2].map((i) => top[i] * top[3] + under[i] * (1 - top[3])).concat(1);
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const behind = (el) => {
    const stack = [];
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage !== "none") return null;
      const c = rgba(s.backgroundColor);
      if (c[3] > 0) stack.push(c);
      if (c[3] === 1) break;
    }
    return stack.reverse().reduce((under, top) => over(top, under), rgba(getComputedStyle(document.body).backgroundColor));
  };
  const low = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const el = walker.currentNode.parentElement;
    if (!walker.currentNode.textContent.trim() || !visible(el) || srOnly(el) || el.closest("[disabled], [aria-disabled=true], [aria-hidden=true], svg, option, video")) continue;
    const bg = behind(el);
    if (!bg) continue;
    const s = getComputedStyle(el);
    const fg = over(rgba(s.color), bg);
    const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
    const ratio = (a + 0.05) / (b + 0.05);
    const large = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && Number(s.fontWeight) >= 700);
    if (ratio < (large ? 3 : 4.5)) low.set(`contrast ${ratio.toFixed(2)} ${s.color} on rgb(${bg.slice(0, 3).map(Math.round)})`, el.textContent.trim().slice(0, 30));
  }
  for (const [k, v] of low) out.push(`${k}: ${v}`);
  return out;
}

try {
  let target;
  for (let i = 0; i < 60 && !target; i++) { await wait(300); target = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json()).then((l) => l.find((t) => t.type === "page")).catch(() => null); }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  let errors = [];
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } if (d.method === "Runtime.exceptionThrown") errors.push(d.params.exceptionDetails.exception?.description?.slice(0, 160)); if (d.method === "Runtime.consoleAPICalled" && d.params.type === "error") errors.push(d.params.args.map((a) => a.value || a.description || "").join(" ").slice(0, 160)); };
  const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async (expression) => { const d = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); return d.result?.exceptionDetails ? `ERR ${d.result.exceptionDetails.exception?.description}` : d.result?.result?.value; };
  await send("Page.enable"); await send("Runtime.enable"); await send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await send("Page.navigate", { url: `${BASE}/about/` }); await wait(1500);
  const width = Number(process.env.WIDTH || 390);
  await send("Emulation.setDeviceMetricsOverride", { width, height: 844, deviceScaleFactor: 1, mobile: width < 768 });
  const found = new Map();
  const add = (text, where) => found.set(text, [...(found.get(text) ?? []), where]);
  for (const theme of themes) {
    await evaluate(`const d=new Date(); localStorage.setItem('noor.welcome.v1', d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()); localStorage.setItem('noor.onboarded.v1','1'); localStorage.setItem('noor.settings.v1', JSON.stringify({theme:'${theme}'}))`);
    for (const route of ROUTES) {
      errors = [];
      await send("Page.navigate", { url: BASE + route }); await wait(1500);
      const result = await evaluate(`(${inspect})()`);
      for (const line of Array.isArray(result) ? result : [String(result)]) add(line, `${theme} ${route}`);
      for (const e of errors) add(`console: ${e}`, `${theme} ${route}`);
      if (theme !== themes[0]) continue;
      // The first Tab stops: each must show where it is.
      const stops = new Set();
      for (let i = 0; i < 25; i++) {
        await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
        await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
        const at = await evaluate(`(()=>{const el=document.activeElement; if(!el||el===document.body) return null; const r=el.getBoundingClientRect(); const ring=(n)=>{const s=getComputedStyle(n); return (s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0)}; const framed=el.classList.contains('quiet-focus')&&(el.parentElement.className.includes('focus-within:')||!!el.closest('dialog')); const seen=ring(el)||framed||!!el.matches('input[type=date],video'); return {name:el.tagName+' '+(el.getAttribute('aria-label')||el.textContent).trim().slice(0,30), ok:seen&&r.width>0&&r.height>0}})()`);
        if (at && !at.ok && !stops.has(at.name)) { stops.add(at.name); add(`focus not visible: ${at.name}`, `${theme} ${route}`); }
      }
    }
  }
  for (const [text, where] of found) console.log(`${text}\n    ${where.slice(0, 4).join(" | ")}${where.length > 4 ? ` +${where.length - 4}` : ""}`);
  console.log(`${found.size} findings on ${ROUTES.length} pages × ${themes.length} themes at ${width}px`);
  ws.close();
} finally {
  chrome.kill();
  await wait(600);
  rmSync(profile, { recursive: true, force: true });
}
