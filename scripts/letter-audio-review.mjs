// A local page for matching each downloaded recording to its letter by ear. Not part of the site.
// node scripts/letter-audio-review.mjs, then open data/raw/commons-letters/review.html
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { LETTERS } from "../src/lib/arabic/letters.ts";

const dir = new URL("../data/raw/commons-letters/", import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith(".wav")).sort();
const chosenFile = new URL("../content/letter-audio.json", import.meta.url);
const saved = existsSync(chosenFile) ? JSON.parse(readFileSync(chosenFile, "utf8")).letters : {};

// A first guess from the uploader's file names only. Several names are unclear, so letters that
// are easy to confuse are offered each other's files too. Nobody has verified these by ear.
const GUESS = {
  "ا": "Alifp Alif_A Hamza_h Hamzap", "ب": "Baaudio Bapron", "ت": "Taaudio Tapron", "ث": "Thaaudio Thep", "ج": "Jeemaudio Jeemp",
  "ح": "Haaaudio Hpron Haaudio Hap", "خ": "Khaaudio Khap", "د": "Dalaudio Dalp", "ذ": "Dhalp Dzalaudio", "ر": "RAAUDIO RAPRON",
  "ز": "ZaiAUDIO Zaip", "س": "Senaudio Senp", "ش": "Shenaudio Shenp", "ص": "Sadaudio Sadp", "ض": "Ddadaudio Ddapro Dddaudio Dddp",
  "ط": "Ttaaudio Ttapron", "ظ": "Dddaudio Dddp Ddadaudio Ddapro", "ع": "Aaaudio Aap", "غ": "Ghaudio Ghp", "ف": "Faaudio Fap",
  "ق": "Qafaudio Qafp Kafaudio Kafp", "ك": "Kafaudio Kafp Qafaudio Qafp", "ل": "Lamudio Lampronn", "م": "Maudio Mpron", "ن": "Naudio Npron",
  "و": "Wawaudio Wapron", "ه": "Haaudio Hap Haaaudio Hpron", "ي": "Yaaudio Yapron",
};

const data = {
  files,
  saved,
  letters: LETTERS.map((l) => ({ ch: l.ch, name: l.name, guess: GUESS[l.ch].split(" ").map((n) => `${n}.wav`).filter((f) => files.includes(f)) })),
};

writeFileSync(new URL("review.html", dir), `<!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>হরফের অডিও মেলানো</title>
<style>body{font:16px/1.6 system-ui;max-width:46rem;margin:auto;padding:16px;background:#f6f2e7;color:#16241d}
section{background:#fff;border:1px solid #ddd;border-radius:12px;padding:12px;margin:12px 0}h2{margin:0;font-size:1.1rem}
.ar{font-size:3rem;line-height:1.8;margin-right:12px}label{display:flex;gap:8px;align-items:center;min-height:44px;flex-wrap:wrap}
button,select{font:inherit;min-height:40px;padding:4px 14px}#bar{position:sticky;top:0;background:#f6f2e7;padding:8px 0}</style>
<h1>হরফের অডিও মেলানো</h1>
<p>প্রতিটি হরফের ফাইল শুনুন। যেটি <b>শুদ্ধ</b>, শুধু সেটি বাছুন। সন্দেহ থাকলে “কোনোটি নয়” রাখুন; সেই হরফে সাইটে অডিও থাকবে না। ফাইলের নাম ভুল হতে পারে, তাই কানে শুনে ঠিক করুন। ক্বারী বা শিক্ষক দিয়ে শোনানো সবচেয়ে ভালো।</p>
<div id="bar"><b id="count"></b> <button id="save">বাছাই সেভ করুন (letter-audio.json)</button></div><div id="list"></div>
<script>
const D=${JSON.stringify(data)};const KEY="noor.letter-audio";let pick={...D.saved};
try{Object.assign(pick,JSON.parse(localStorage.getItem(KEY)||"{}"))}catch{}
const el=(t,p={},...k)=>{const e=Object.assign(document.createElement(t),p);e.append(...k);return e};
const player=new Audio();const play=f=>{if(!f)return;player.src=f;player.play()};
const count=()=>{document.getElementById("count").textContent="বাছা হয়েছে "+Object.values(pick).filter(Boolean).length+"/"+D.letters.length};
for(const l of D.letters){const box=el("section",{},el("h2",{},el("span",{className:"ar",lang:"ar",textContent:l.ch}),l.name));
const radios=[];const set=f=>{pick[l.ch]=f;try{localStorage.setItem(KEY,JSON.stringify(pick))}catch{}count()};
const row=(f,text)=>{const r=el("input",{type:"radio",name:l.ch,checked:(pick[l.ch]||"")===f});r.onchange=()=>set(f);radios.push(r);
const line=el("label",{},r,text);if(f)line.append(el("button",{type:"button",textContent:"▶ শুনুন",onclick:()=>play(f)}));box.append(line)};
for(const f of l.guess)row(f,f);row("","কোনোটি নয়");
const other=el("select",{},el("option",{value:"",textContent:"অন্য ফাইল খুঁজুন…"}),...D.files.map(f=>el("option",{value:f,textContent:f})));
other.onchange=()=>{if(!other.value)return;play(other.value);if(confirm(other.value+" ফাইলটি "+l.name+" হিসেবে বাছবেন?")){set(other.value);radios.forEach(r=>r.checked=false)}};
box.append(other);if(pick[l.ch]&&!l.guess.includes(pick[l.ch]))box.append(el("p",{textContent:"এখন বাছা: "+pick[l.ch]}));
document.getElementById("list").append(box)}
count();
document.getElementById("save").onclick=()=>{const letters=Object.fromEntries(Object.entries(pick).filter(([,f])=>f));
el("a",{href:URL.createObjectURL(new Blob([JSON.stringify({letters},null,1)],{type:"application/json"})),download:"letter-audio.json"}).click()};
</script></html>`);
console.log(`review page: ${files.length} recordings`);
