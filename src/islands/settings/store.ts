"use client";

import { useSyncExternalStore } from "react";
import { SETTINGS_KEY as KEY } from "@/lib/theme-script";

/**
 * Display settings shared by every island on the page: theme, motion pause, custom cursor.
 * The theme opens light (the signage ground); a dark choice persists in localStorage and is
 * applied before first paint by THEME_SCRIPT in the locale layout.
 */
export type Theme = "light" | "dark";
type State = { theme: Theme; paused: boolean; cursor: boolean };

const serverState: State = { theme: "light", paused: false, cursor: true };
let state: State | null = null;
const listeners = new Set<() => void>();

function load(): State {
  if (state) return state;
  const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  let saved: Partial<State> = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<State>;
  } catch {
    // Private mode or blocked storage: settings just won't persist.
  }
  state = { theme, paused: saved.paused === true, cursor: saved.cursor !== false };
  return state;
}

function set(patch: Partial<State>) {
  state = { ...load(), ...patch };
  if (patch.theme) document.documentElement.dataset.theme = patch.theme;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
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
