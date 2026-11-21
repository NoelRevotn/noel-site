import { getTranslations } from "next-intl/server";
import { Stop } from "@/components/ui/Stop";
import { profile } from "@/lib/content";
import s from "./contact.module.css";

/** The last stop: how to reach Noel. */
export async function ContactStrip() {
  const t = await getTranslations();
  return (
    <Stop id="contact" title={t("sections.contact")}>
      <p className={s.text} data-reveal>
        {t("contact.text")}
      </p>
      <ul className={s.links} data-reveal>
        <li>
          <a className={s.plate} href={profile.links.linkedin} target="_blank" rel="noreferrer">
            {t("contact.linkedin")}
          </a>
        </li>
        <li>
          <a className={s.plate} href={profile.links.github} target="_blank" rel="noreferrer">
            {t("contact.github")}
          </a>
        </li>
        {profile.email ? (
          <li>
            <a className={s.plate} href={`mailto:${profile.email}`}>
              {t("contact.email")}
            </a>
          </li>
        ) : (
          <li className={s.todo}>TODO(noel): {t("contact.email")}</li>
        )}
      </ul>
    </Stop>
  );
}
