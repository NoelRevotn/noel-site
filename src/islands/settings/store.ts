"use client";

import { useSyncExternalStore } from "react";
import { applyChrome, SETTINGS_KEY as KEY } from "@/lib/theme-script";

/**
 * Display settings shared by every island on the page: theme, motion pause, custom cursor.
 * The theme follows the system until the visitor picks one with the toggle; a choice persists in
 * localStorage and HEAD_SCRIPT applies it before first paint.
 */
export type Theme = "light" | "dark";
type State = { theme: Theme; paused: boolean; cursor: boolean };
type Saved = { themeChoice?: Theme; theme?: Theme; paused?: boolean; cursor?: boolean };

const serverState: State = { theme: "light", paused: false, cursor: true };
let state: State | null = null;
let choice: Theme | null = null;
const listeners = new Set<() => void>();

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  applyChrome(theme);
}

function load(): State {
  if (state) return state;
  const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  let saved: Saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Saved;
  } catch {
    // Private mode or blocked storage: settings just won't persist.
  }
  choice = saved.themeChoice ?? (saved.theme === "dark" ? "dark" : null);
  state = { theme, paused: saved.paused === true, cursor: saved.cursor !== false };
  document.documentElement.dataset.motion = state.paused ? "paused" : "on";
  // Until the visitor picks a theme, follow the system as it changes (e.g. sunset dark mode).
  window.matchMedia(DARK).addEventListener("change", (e) => {
    if (choice) return;
    state = { ...load(), theme: e.matches ? "dark" : "light" };
    applyTheme(state.theme);
    listeners.forEach((l) => l());
  });
  return state;
}

function set(patch: Partial<State>) {
  state = { ...load(), ...patch };
  if (patch.theme) {
    choice = patch.theme;
    applyTheme(patch.theme);
  }
  // CSS loops (e.g. the status pulse) pause on html[data-motion="paused"].
  if (patch.paused !== undefined) document.documentElement.dataset.motion = patch.paused ? "paused" : "on";
  try {
    const saved: Saved = {
      paused: state.paused,
      cursor: state.cursor,
      ...(choice ? { themeChoice: choice } : {}),
    };
    localStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    // Ignore: see load().
  }
  listeners.forEach((l) => l());
}

export const settings = {
  get: (): State => (typeof document === "undefined" ? serverState : load()),
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  setTheme: (theme: Theme) => set({ theme }),
  setPaused: (paused: boolean) => set({ paused }),
  setCursor: (cursor: boolean) => set({ cursor }),
};

export function useSettings(): State {
  return useSyncExternalStore(settings.subscribe, settings.get, () => serverState);
}

/** Live media-query hook; `fallback` is what the static HTML assumes. */
export function useMedia(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

export const REDUCED = "(prefers-reduced-motion: reduce)";
export const FINE_POINTER = "(hover: hover) and (pointer: fine)";
export const DARK = "(prefers-color-scheme: dark)";

export function useResolvedTheme(): Theme {
  return useSettings().theme;
}
