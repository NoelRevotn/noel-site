"use client";

import { useRef } from "react";
import { useLabCursor } from "../useLabCursor";

/** Lab A cursor: a station mark that becomes an interchange plate naming the action. */
export function StationCursor({
  className,
  plateClassName,
}: {
  className?: string;
  plateClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { enabled, target } = useLabCursor(ref, undefined, 0.35);
  if (!enabled) return null;
  return (
    <div ref={ref} className={className} data-state={target ? "link" : "idle"} aria-hidden="true">
      <span className={plateClassName}>{target?.label}</span>
    </div>
  );
}
