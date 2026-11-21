import type { ReactNode } from "react";
import s from "./scene.module.css";

/**
 * A home section as one idea per screen: an icon, one short sentence as the heading, and the
 * content below, centred with a lot of air around it.
 */
export function Scene({
  id,
  title,
  icon,
  children,
}: {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className={s.scene} aria-labelledby={`${id}-title`}>
      {icon && (
        <div className={s.icon} data-reveal>
          {icon}
        </div>
      )}
      <h2 id={`${id}-title`} className={s.title} data-reveal>
        {title}
      </h2>
      <div className={s.body}>{children}</div>
    </section>
  );
}

/** The track between two scenes: rails and sleepers; a short train crosses when it comes into view. */
export function TrackDivider({ line }: { line: "ml" | "sys" | "web" }) {
  return (
    <div className={s.track} data-line={line} data-reveal aria-hidden="true">
      <span className={s.train} />
    </div>
  );
}

/** A row of chips: short labels instead of a list of sentences. */
export function Chips({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <ul className={s.chips} aria-label={label}>
      {children}
    </ul>
  );
}

export function Chip({ children, line, mark }: { children: ReactNode; line?: string; mark?: ReactNode }) {
  return (
    <li className={s.chip} data-line={line}>
      {mark}
      {children}
    </li>
  );
}
