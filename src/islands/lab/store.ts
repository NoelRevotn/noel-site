"use client";

import { useSyncExternalStore } from "react";

/** Shared per-page state for the lab islands: theme, motion pause, custom cursor. */
export type Theme = "system" | "light" | "dark";
type State = { theme: Theme; paused: boolean; cursor: boolean };

let state: State = { theme: "system", paused: false, cursor: true };
const serverState: State = state;
const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  if (patch.theme !== undefined) {
    const root = document.documentElement;
    if (patch.theme === "system") delete root.dataset.theme;
    else root.dataset.theme = patch.theme;
  }
  listeners.forEach((l) => l());
}

export const labStore = {
  get: () => state,
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

export function useLabState(): State {
  return useSyncExternalStore(labStore.subscribe, labStore.get, () => serverState);
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

/** The theme actually showing, with "system" resolved. */
export function useResolvedTheme(): "light" | "dark" {
  const { theme } = useLabState();
  const systemDark = useMedia(DARK);
  return theme === "system" ? (systemDark ? "dark" : "light") : theme;
}
