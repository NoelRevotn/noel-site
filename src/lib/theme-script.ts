/** Storage key for display settings (theme, motion, cursor). */
export const SETTINGS_KEY = "noel-site:settings";

/**
 * Inline, render-blocking and tiny: picks the theme before first paint (no flash) and marks <html>
 * as JS-capable so reveal styles only hide content when JS can show it again.
 * Theme: the visitor's saved choice if any, otherwise the system's light/dark setting. Following
 * the system is what stops phone browsers from auto-darkening the light theme on their own.
 * (`theme: "dark"` is the pre-2026-11-22 format: only an explicit dark choice was ever saved as it.)
 */
// The script also writes the color-scheme and theme-color meta tags itself: if React rendered
// them, it would re-add its own copy on hydration after the script changed them.
export const HEAD_SCRIPT = `var d=document.documentElement;d.classList.add("js");var t="light";try{var s=JSON.parse(localStorage.getItem("${SETTINGS_KEY}")||"{}");t=s.themeChoice||(s.theme==="dark"?"dark":"")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}catch(e){}if(t==="dark")d.dataset.theme="dark";function m(n,v){var e=document.createElement("meta");e.name=n;e.content=v;document.head.appendChild(e)}m("color-scheme",t==="dark"?"dark":"only light");m("theme-color",t==="dark"?"#070e1a":"#dde4ec");`;

/** Browser chrome to match the theme: the address bar colour and the declared colour scheme. */
export function applyChrome(theme: "light" | "dark") {
  const bar = document.querySelector<HTMLMetaElement>("meta[name=theme-color]");
  if (bar) bar.content = theme === "dark" ? "#070e1a" : "#dde4ec";
  const scheme = document.querySelector<HTMLMetaElement>("meta[name=color-scheme]");
  if (scheme) scheme.content = theme === "dark" ? "dark" : "only light";
}
