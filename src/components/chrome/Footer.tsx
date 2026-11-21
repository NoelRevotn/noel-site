import { getTranslations } from "next-intl/server";
import { profile } from "@/lib/content";
import s from "./footer.module.css";

/** Footer: the line's terminus. Socials, how it's built, source. */
export async function Footer() {
  const t = await getTranslations("footer");
  return (
    <footer className={s.footer}>
      <div className={s.terminus} aria-hidden="true" />
      <p className={s.name}>{profile.name}</p>
      <ul className={s.links}>
        <li>
          <a href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </li>
        <li>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </li>
        <li>
          <a href={profile.links.repo} target="_blank" rel="noreferrer">
            {t("source")}
          </a>
        </li>
      </ul>
      <p className={s.built}>{t("built")}</p>
    </footer>
  );
}
