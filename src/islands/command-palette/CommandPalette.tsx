"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { settings } from "../settings/store";
import { PALETTE_EVENT } from "./events";
import s from "./palette.module.css";

type Command = { id: string; group: string; label: string; hint?: string; run: () => void };

/**
 * ⌘K / Ctrl+K command menu (PLAN §7.3). A native <dialog> gives focus trapping, Escape and the
 * top layer for free; CSS handles the open/close motion.
 */
export function CommandPalette({
  links,
  email,
}: {
  links: { github: string; linkedin: string };
  email?: string | null;
}) {
  const t = useTranslations("palette");
  const tn = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => router.push(href);
    return [
      { id: "home", group: t("go"), label: tn("home"), run: go("/") },
      { id: "projects", group: t("go"), label: tn("projects"), run: go("/projects") },
      { id: "cv", group: t("go"), label: tn("cv"), run: go("/cv") },
      { id: "blog", group: t("go"), label: tn("blog"), run: go("/blog") },
      { id: "contact", group: t("go"), label: tn("contact"), run: go("/contact") },
      {
        id: "language",
        group: t("actions"),
        label: t("language"),
        run: () => router.replace(pathname, { locale: locale === "en" ? "es" : "en" }),
      },
      {
        id: "theme",
        group: t("actions"),
        label: t("theme"),
        run: () => settings.setTheme(settings.get().theme === "dark" ? "light" : "dark"),
      },
      {
        id: "motion",
        group: t("actions"),
        label: t("motion"),
        run: () => settings.setPaused(!settings.get().paused),
      },
      {
        id: "cursor",
        group: t("actions"),
        label: t("cursor"),
        run: () => settings.setCursor(!settings.get().cursor),
      },
      ...(email
        ? [
            {
              id: "email",
              group: t("actions"),
              label: t("copyEmail"),
              hint: email,
              run: () => void navigator.clipboard?.writeText(email),
            },
          ]
        : []),
      {
        id: "github",
        group: t("links"),
        label: "GitHub",
        hint: "github.com/NoelRevotn",
        run: () => window.open(links.github, "_blank", "noopener"),
      },
      {
        id: "linkedin",
        group: t("links"),
        label: "LinkedIn",
        run: () => window.open(links.linkedin, "_blank", "noopener"),
      },
    ];
  }, [t, tn, router, pathname, locale, links, email]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? commands.filter((c) => `${c.group} ${c.label}`.toLowerCase().includes(q)) : commands;
  }, [commands, query]);

  const open = () => {
    const d = dialog.current;
    if (!d || d.open) return;
    setQuery("");
    setActive(0);
    d.showModal();
    input.current?.focus();
  };

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, open);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_EVENT, open);
    };
  });

  const run = (c: Command) => {
    dialog.current?.close();
    c.run();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      run(results[active]);
    }
  };

  let lastGroup = "";
  return (
    <dialog
      ref={dialog}
      className={s.dialog}
      aria-label={t("title")}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
    >
      <div className={s.panel}>
        <input
          ref={input}
          className={s.input}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
          aria-label={t("title")}
          placeholder={t("placeholder")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
        />
        <ul id={listId} role="listbox" className={s.list} aria-label={t("title")}>
          {results.length === 0 && <li className={s.empty}>{t("empty")}</li>}
          {results.map((c, i) => {
            const header = c.group !== lastGroup ? c.group : null;
            lastGroup = c.group;
            return (
              <li key={c.id} role="presentation">
                {header && (
                  <span className={s.group} aria-hidden="true">
                    {header}
                  </span>
                )}
                <div
                  id={`${listId}-${c.id}`}
                  role="option"
                  aria-selected={i === active}
                  className={s.option}
                  onMouseMove={() => setActive(i)}
                  onClick={() => run(c)}
                >
                  <span className={s.dot} aria-hidden="true" />
                  {c.label}
                  {c.hint && <span className={s.hint}>{c.hint}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </dialog>
  );
}
