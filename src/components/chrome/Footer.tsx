import { getTranslations } from "next-intl/server";
import { profile } from "@/lib/content";
import s from "./footer.module.css";

/**
 * Footer: the end of the line. The track comes in from the left and stops at a buffer, with Noel's
 * name as the last station; a train pulls in when the footer comes into view.
 */
export async function Footer() {
  const t = await getTranslations("footer");
  return (
    <footer className={s.footer}>
      {/* data-reveal sits on the wrapper: the track starts clipped to nothing, which observers can't see. */}
      <div className={s.terminal} data-reveal>
        <div className={s.track} aria-hidden="true">
          <span className={s.train} />
          <span className={s.stop} />
          <span className={s.buffer} />
        </div>
        <div className={s.station}>
          <p className={s.name}>{profile.name}</p>
          <p className={s.last}>{t("terminal")}</p>
        </div>
      </div>
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
