import type { ReactNode } from "react";
import { LineIcon, type IconName } from "@/components/icons/LineIcon";
import s from "./ui.module.css";

/** A section as a stop on the trunk line: a station mark level with its heading. */
export function Stop({
  id,
  title,
  icon,
  children,
}: {
  id: string;
  title: string;
  icon?: IconName;
  children: ReactNode;
}) {
  return (
    <section id={id} className={s.stop} aria-labelledby={`${id}-title`}>
      <div className={s.stopHead} data-reveal>
        {icon && <LineIcon name={icon} />}
        <h2 id={`${id}-title`} className={s.stopTitle}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

/** The vertical line that runs down the page through every stop. */
export function Trunk({ children }: { children: ReactNode }) {
  return <div className={s.trunk}>{children}</div>;
}

/** Mono line tag on a domain colour: ML, SY, WB. */
export function LineCode({ line, children }: { line: string; children: ReactNode }) {
  return (
    <span className={s.code} data-line={line}>
      {children}
    </span>
  );
}

/** Filled = built, hollow = in progress. */
export function StationMark({ built = true }: { built?: boolean }) {
  return <span className={s.mark} data-built={built} aria-hidden="true" />;
}
