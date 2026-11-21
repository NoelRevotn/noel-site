"use client";

import { FINE_POINTER, REDUCED, settings, useMedia, useSettings } from "./store";

export type DisplayLabels = {
  group: string;
  dark: string;
  pause: string;
  motionOff: string;
  motionOffHint: string;
  cursor: string;
};

const EN: DisplayLabels = {
  group: "Display settings",
  dark: "Dark",
  pause: "Pause motion",
  motionOff: "Motion off",
  motionOffHint: "Motion is off because your system asks for reduced motion",
  cursor: "Custom cursor",
};

type Props = {
  className?: string;
  buttonClassName?: string;
  labels?: DisplayLabels;
  /** Kept for the lab pages; the site always opens light. */
  initialTheme?: "light" | "dark";
};

/** Motion and cursor switches (the theme toggle lives in the rail). WCAG 2.2.2 requires the pause. */
export function DisplayControls({ className, buttonClassName, labels = EN }: Props) {
  const { paused, cursor } = useSettings();
  const reduced = useMedia(REDUCED);
  const fine = useMedia(FINE_POINTER, true);

  return (
    <div className={className} role="group" aria-label={labels.group}>
      <button
        type="button"
        className={buttonClassName}
        aria-pressed={paused || reduced}
        disabled={reduced}
        title={reduced ? labels.motionOffHint : undefined}
        onClick={() => settings.setPaused(!paused)}
      >
        {reduced ? labels.motionOff : labels.pause}
      </button>
      {fine && (
        <button
          type="button"
          className={buttonClassName}
          aria-pressed={cursor}
          onClick={() => settings.setCursor(!cursor)}
        >
          {labels.cursor}
        </button>
      )}
    </div>
  );
}
