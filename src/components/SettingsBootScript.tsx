import { DEFAULT_SETTINGS, SCALE_MAX, SCALE_MIN, SETTINGS_KEY, THEMES } from "@/lib/settings";
import { WELCOME_KEY } from "@/lib/welcome";

/**
 * Applies saved theme and sizes before first paint, so there is no flash.
 * Must stay equivalent to parseSettings + applySettings (covered by a test).
 */
export const BOOT_SCRIPT = `(function(){try{
var s=JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_KEY)}));
if(!s||typeof s!=="object")return;
var r=document.documentElement;
r.dataset.theme=${JSON.stringify(THEMES)}.indexOf(s.theme)>-1?s.theme:${JSON.stringify(DEFAULT_SETTINGS.theme)};
r.dataset.easy=String(s.easyMode===true);
function c(v){return typeof v==="number"&&isFinite(v)?Math.min(${SCALE_MAX},Math.max(${SCALE_MIN},v)):1}
r.style.setProperty("--ar-scale",String(c(s.arScale)));
r.style.setProperty("--bn-scale",String(c(s.bnScale)));
}catch(e){}})();`;

/** Marks the page before first paint when today's welcome has not been seen yet. */
export const WELCOME_SCRIPT = `(function(){try{
var d=new Date(),t=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
if(localStorage.getItem(${JSON.stringify(WELCOME_KEY)})!==t)document.documentElement.dataset.welcome="1";
}catch(e){}})();`;

export function SettingsBootScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT + WELCOME_SCRIPT }}
    />
  );
}
