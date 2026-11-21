import { Fragment, type ReactNode } from "react";
import { LineIcon, type IconName } from "@/components/icons/LineIcon";
import s from "./ui.module.css";

/** Renders content text, highlighting any TODO(noel) placeholder so it can't be missed (PLAN §0 rule 2). */
export function Text({ children }: { children: string }) {
  const parts = children.split(/(TODO\(noel\):[^.]*\.?)/);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("TODO(noel)") ? (
          <mark key={i} className={s.todo}>
            {p}
          </mark>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

/** Page title as the first stop on the trunk; `extra` shares its panel (e.g. the CV contact line). */
export function PageTitle({
  children,
  lead,
  extra,
  icon,
}: {
  children: string;
  lead?: string;
  extra?: ReactNode;
  icon?: IconName;
}) {
  return (
    <header className={s.pageHead}>
      {/* Only the icon is revealed: the title is the first paint and must never wait for JS. */}
      {icon && (
        <span data-reveal>
          <LineIcon name={icon} size="4rem" />
        </span>
      )}
      <h1 className={s.pageTitle}>{children}</h1>
      {lead && <p className={s.lead}>{lead}</p>}
      {extra}
    </header>
  );
}
