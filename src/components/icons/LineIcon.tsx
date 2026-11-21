import s from "./icons.module.css";

/**
 * Línea's own icon set: drawn on a 48-unit grid with the map's rules (horizontal, vertical and
 * 45° strokes only, round joins), so every icon looks like part of the network. Inside a
 * [data-reveal] block each stroke draws itself in when the block appears (CSS only; static under
 * reduced motion). Decorative: the text beside an icon always says what it means.
 */
const PATHS = {
  // A small agent: head, antenna, eyes.
  agent: ["M14 18h20v18H14z", "M24 18v-6", "M21 9h6", "M19 25v3", "M29 25v3", "M20 32h8"],
  // Bars over a baseline, with a 45° trend.
  data: ["M10 38h28", "M15 38V28", "M24 38V22", "M33 38V16", "M11 24l8-8 6 6 12-12"],
  // An octilinear water drop.
  drop: ["M24 8l10 14v8l-8 8h-4l-8-8v-8z", "M20 28l4 4"],
  // A chat bubble asking a question of a table.
  query: ["M8 10h26v18H18l-8 8v-8H8z", "M14 17h14", "M14 22h8", "M34 18h6v20h-6v6l-6-6h-8v-6"],
  // A route between two stops.
  route: ["M10 36l10-10h8l10-10", "M10 36m-3 0h6", "M38 16m-3 0h6", "M10 33v6", "M38 13v6"],
  // Two stacked servers.
  server: ["M10 10h28v12H10z", "M10 26h28v12H10z", "M15 16h3", "M15 32h3", "M30 16h3", "M30 32h3"],
  // A browser window.
  browser: ["M8 10h32v28H8z", "M8 18h32", "M12 14h2", "M17 14h2", "M14 26h20", "M14 31h12"],
  // A terminal prompt.
  terminal: ["M8 10h32v28H8z", "M14 19l6 6-6 6", "M24 31h10"],
  // An open book.
  learn: ["M8 12h12l4 4 4-4h12v24H28l-4 4-4-4H8z", "M24 16v24"],
  // A briefcase.
  work: ["M8 16h32v22H8z", "M18 16v-6h12v6", "M8 26h32", "M22 26v4h4v-4"],
  // A pen writing a line.
  write: ["M14 30l18-18 4 4-18 18-6 2z", "M28 16l4 4", "M10 40h28"],
  // A signal: a station broadcasting.
  signal: [
    "M24 30v10",
    "M20 40h8",
    "M24 26m-3 0h6",
    "M16 18l-4 4 4 4",
    "M32 18l4 4-4 4",
    "M12 12l-8 10 8 10",
    "M36 12l8 10-8 10",
  ],
  // A train front.
  train: [
    "M14 8h20l4 4v20l-4 4H14l-4-4V12z",
    "M14 14h20v8H14z",
    "M16 30h2",
    "M30 30h2",
    "M16 36l-4 6",
    "M32 36l4 6",
  ],
} as const;

export type IconName = keyof typeof PATHS;

export function LineIcon({
  name,
  line,
  size = "3.5rem",
  className,
}: {
  name: IconName;
  /** Domain colour (ml, sys, web); ink when omitted. */
  line?: "ml" | "sys" | "web" | "tools";
  size?: string;
  className?: string;
}) {
  return (
    <svg
      className={className ? `${s.icon} ${className}` : s.icon}
      viewBox="0 0 48 48"
      data-line={line}
      style={{ width: size, height: size }}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} pathLength={1} />
      ))}
    </svg>
  );
}

/** The icon for each project, by slug. */
export const PROJECT_ICON: Record<string, IconName> = {
  buddy: "agent",
  datalizer: "data",
  h2oeste: "drop",
  agentequery: "query",
  itinera: "route",
};

/** The icon for each skill group. */
export const GROUP_ICON: Record<string, IconName> = {
  ml: "agent",
  sys: "server",
  web: "browser",
  tools: "terminal",
};
