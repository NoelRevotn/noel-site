/** Storage key for display settings (theme, motion, cursor). */
export const SETTINGS_KEY = "noel-site:settings";

/**
 * Inline, render-blocking and tiny: applies a saved dark theme before first paint (no flash),
 * and marks <html> as JS-capable so reveal styles only hide content when JS can show it again.
 */
export const HEAD_SCRIPT = `document.documentElement.classList.add("js");try{var s=JSON.parse(localStorage.getItem("${SETTINGS_KEY}")||"{}");if(s.theme==="dark"){document.documentElement.dataset.theme="dark";var m=document.querySelector("meta[name=theme-color]");if(m)m.content="#070e1a";var c=document.querySelector("meta[name=color-scheme]");if(c)c.content="dark"}}catch(e){}`;

/** Browser chrome to match the theme: the address bar colour and the declared colour scheme. */
export function applyChrome(theme: "light" | "dark") {
  const bar = document.querySelector<HTMLMetaElement>("meta[name=theme-color]");
  if (bar) bar.content = theme === "dark" ? "#070e1a" : "#dde4ec";
  const scheme = document.querySelector<HTMLMetaElement>("meta[name=color-scheme]");
  if (scheme) scheme.content = theme === "dark" ? "dark" : "only light";
}
