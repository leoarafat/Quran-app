import { BN_FONTS, DARK_QUERY, DEFAULT_SETTINGS, OLD_THEMES, SCALE_MAX, SCALE_MIN, SETTINGS_KEY, THEMES } from "@/lib/settings";
import { WELCOME_KEY } from "@/lib/welcome";

/**
 * Applies saved theme and sizes before first paint, so there is no flash.
 * Must stay equivalent to parseSettings + applySettings (covered by a test).
 */
export const BOOT_SCRIPT = `(function(){try{
var s=JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_KEY)}));
if(!s||typeof s!=="object")return;
var r=document.documentElement;
var o=${JSON.stringify(OLD_THEMES)},m=typeof s.theme==="string"&&Object.prototype.hasOwnProperty.call(o,s.theme)?o[s.theme]:s.theme;
if(m==="system")m=typeof matchMedia==="function"&&matchMedia(${JSON.stringify(DARK_QUERY)}).matches?"night":"paper";
r.dataset.theme=${JSON.stringify(THEMES)}.indexOf(m)>-1?m:${JSON.stringify(DEFAULT_SETTINGS.theme)};
r.dataset.easy=String(s.easyMode===true);
r.dataset.contrast=String(s.contrast===true);
r.dataset.bnfont=${JSON.stringify(BN_FONTS)}.indexOf(s.bnFont)>-1?s.bnFont:${JSON.stringify(DEFAULT_SETTINGS.bnFont)};
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
