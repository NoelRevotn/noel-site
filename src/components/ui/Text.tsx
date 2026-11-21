import { Fragment, type ReactNode } from "react";
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
export function PageTitle({ children, lead, extra }: { children: string; lead?: string; extra?: ReactNode }) {
  return (
    <header className={s.pageHead}>
      <h1 className={s.pageTitle}>{children}</h1>
      {lead && <p className={s.lead}>{lead}</p>}
      {extra}
    </header>
  );
}
