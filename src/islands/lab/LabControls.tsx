"use client";

import { labStore, REDUCED, useLabState, useMedia, useResolvedTheme } from "./store";

type Props = { className?: string; buttonClassName?: string };

/** Theme, motion and cursor switches for every lab. WCAG 2.2.2 requires the pause. */
export function LabControls({ className, buttonClassName }: Props) {
  const { paused, cursor } = useLabState();
  const resolved = useResolvedTheme();
  const reduced = useMedia(REDUCED);
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
      <button
        type="button"
        className={buttonClassName}
        aria-pressed={cursor}
        onClick={() => labStore.setCursor(!cursor)}
      >
        Custom cursor
      </button>
    </div>
  );
}
