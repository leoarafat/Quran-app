// Screenshots and in-page checks in headless Chrome: node scripts/dev/shot.mjs jobs.json
// jobs: [{url,out,w,h,full,eval,wait,storage,dark,reduce}]
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
const jobs = JSON.parse(readFileSync(process.argv[2], "utf8"));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const PORT = 9300 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(tmpdir(), "shot-"));
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new","--disable-gpu","--no-first-run","--hide-scrollbars",`--remote-debugging-port=${PORT}`,`--user-data-dir=${profile}`,"about:blank"], { stdio: "ignore" });
try {
  let t; for (let i=0;i<60&&!t;i++){ await wait(300); t = await fetch(`http://127.0.0.1:${PORT}/json/list`).then(r=>r.json()).then(l=>l.find(x=>x.type==="page")).catch(()=>null); }
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
  let id=0; const pend=new Map(); let errors=[];
  ws.onmessage=(m)=>{const d=JSON.parse(m.data); if(pend.has(d.id)){pend.get(d.id)(d);pend.delete(d.id);} if(d.method==="Runtime.exceptionThrown") errors.push(d.params.exceptionDetails.exception?.description?.slice(0,200)); if(d.method==="Runtime.consoleAPICalled"&&d.params.type==="error") errors.push(d.params.args.map(a=>a.value||a.description||"").join(" ").slice(0,200));};
  const send=(method,params={})=>new Promise(r=>{pend.set(++id,r);ws.send(JSON.stringify({id,method,params}));});
  const ev=async(e)=>{const d=await send("Runtime.evaluate",{expression:e,awaitPromise:true,returnByValue:true,userGesture:true}); return d.result?.exceptionDetails?`ERR ${d.result.exceptionDetails.exception?.description?.slice(0,300)}`:d.result?.result?.value;};
  await send("Page.enable"); await send("Runtime.enable");
  let script;
  for (const j of jobs) {
    errors=[];
    const w=j.w||390,h=j.h||844;
    await send("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:j.scale||1,mobile:w<768&&!j.url.startsWith("file:")});
    const features=[]; if(j.dark!==undefined) features.push({name:"prefers-color-scheme",value:j.dark?"dark":"light"}); if(j.reduce) features.push({name:"prefers-reduced-motion",value:"reduce"});
    await send("Emulation.setEmulatedMedia",{features});
    if (script) { await send("Page.removeScriptToEvaluateOnNewDocument",{identifier:script}); script=null; }
    if (!j.url.startsWith("file:")) {
      const store = {"noor.welcome.v1":"__today__", "noor.onboarded.v1":"1", ...(j.storage||{})};
      const src=`(()=>{if(sessionStorage.getItem('__s'))return;sessionStorage.setItem('__s','1');localStorage.clear();const s=${JSON.stringify(store)};const d=new Date();for(const k in s){localStorage.setItem(k,s[k]==='__today__'?d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate():s[k]);}})()`;
      script=(await send("Page.addScriptToEvaluateOnNewDocument",{source:src})).result.identifier;
      await ev("sessionStorage.clear()");
    }
    await send("Page.navigate",{url:j.url}); await wait(j.wait||1800);
    await ev("document.fonts.ready.then(()=>1)");
    if (j.eval) { const r=await ev(j.eval); if(r!==undefined) console.log(j.out||j.url,"eval:",typeof r==="string"?r:JSON.stringify(r)); await wait(j.after||700); }
    const sw=await ev("document.documentElement.scrollWidth");
    if (j.out) {
      let clip;
      if (j.full) { const H=await ev("Math.max(document.documentElement.scrollHeight, document.querySelector('.m')?.scrollHeight||0)"); await send("Emulation.setDeviceMetricsOverride",{width:w,height:Math.min(H,j.max||5000),deviceScaleFactor:j.scale||1,mobile:w<768&&!j.url.startsWith("file:")}); await wait(400); }
      const s=await send("Page.captureScreenshot",{format:"png",...(clip?{clip}:{})}); writeFileSync(j.out, Buffer.from(s.result.data,"base64"));
    }
    if (sw>w) console.log("OVERFLOW",j.url,w,sw);
    if (errors.length) console.log("ERRORS",j.url,errors.slice(0,4));
  }
  ws.close();
} finally { chrome.kill(); await wait(500); rmSync(profile,{recursive:true,force:true}); }
