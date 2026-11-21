/** Storage key for display settings (theme, motion, cursor). */
export const SETTINGS_KEY = "noel-site:settings";

/**
 * Inline, render-blocking and tiny: applies a saved dark theme before first paint (no flash),
 * and marks <html> as JS-capable so reveal styles only hide content when JS can show it again.
 */
export const HEAD_SCRIPT = `document.documentElement.classList.add("js");try{var s=JSON.parse(localStorage.getItem("${SETTINGS_KEY}")||"{}");if(s.theme==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;
