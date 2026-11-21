"use client";

import { useEffect } from "react";
import { FINE_POINTER, labStore, REDUCED, useLabState, useMedia, useResolvedTheme } from "./store";

type Props = {
  className?: string;
  buttonClassName?: string;
  /** The palette this direction opens in, whatever the OS asks; the other one is opt-in. */
  initialTheme?: "light" | "dark";
};

/** Theme, motion and cursor switches for every lab. WCAG 2.2.2 requires the pause. */
export function LabControls({ className, buttonClassName, initialTheme }: Props) {
  const { paused, cursor } = useLabState();
  const resolved = useResolvedTheme();
  const reduced = useMedia(REDUCED);
  const fine = useMedia(FINE_POINTER, true);

  useEffect(() => {
    if (initialTheme && labStore.get().theme === "system") labStore.setTheme(initialTheme);
  }, [initialTheme]);

  return (
    <div className={className} role="group" aria-label="Display settings">
      <button
        type="button"
        className={buttonClassName}
        aria-pressed={resolved === "dark"}
        onClick={() => labStore.setTheme(resolved === "dark" ? "light" : "dark")}
      >
        Dark
      </button>
      <button
        type="button"
        className={buttonClassName}
        aria-pressed={paused || reduced}
        disabled={reduced}
        title={reduced ? "Motion is off because your system asks for reduced motion" : undefined}
        onClick={() => labStore.setPaused(!paused)}
      >
        {reduced ? "Motion off" : "Pause motion"}
      </button>
      {fine && (
        <button
          type="button"
          className={buttonClassName}
          aria-pressed={cursor}
          onClick={() => labStore.setCursor(!cursor)}
        >
          Custom cursor
        </button>
      )}
    </div>
  );
}
