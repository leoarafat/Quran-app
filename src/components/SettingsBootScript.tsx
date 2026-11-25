import { SCALE_MAX, SCALE_MIN, SETTINGS_KEY, THEMES } from "@/lib/settings";

/**
 * Applies saved theme and sizes before first paint, so there is no flash.
 * Must stay equivalent to parseSettings + applySettings (covered by a test).
 */
export const BOOT_SCRIPT = `(function(){try{
var s=JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_KEY)}));
if(!s||typeof s!=="object")return;
var r=document.documentElement;
r.dataset.theme=${JSON.stringify(THEMES)}.indexOf(s.theme)>-1?s.theme:"light";
r.dataset.easy=String(s.easyMode===true);
function c(v){return typeof v==="number"&&isFinite(v)?Math.min(${SCALE_MAX},Math.max(${SCALE_MIN},v)):1}
r.style.setProperty("--ar-scale",String(c(s.arScale)));
r.style.setProperty("--bn-scale",String(c(s.bnScale)));
}catch(e){}})();`;

export function SettingsBootScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }}
    />
  );
}
