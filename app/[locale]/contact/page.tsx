import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Trunk } from "@/components/ui/Stop";
import { PageTitle } from "@/components/ui/Text";
import { CopyEmail } from "@/islands/copy-email/CopyEmail";
import { profile } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import s from "./contact.module.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  return pageMetadata(locale, "/contact", `${t("title")} · Noel Echeverría`, t("lead"));
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <main id="main">
      <Trunk>
        <PageTitle lead={`${t("hero.status")} ${t("contactPage.lead")}`}>{t("contactPage.title")}</PageTitle>
        <div className={s.body}>
          {profile.email && (
            <div className={s.email} data-reveal>
              <a href={`mailto:${profile.email}`} className={s.address}>
                {profile.email}
              </a>
              <CopyEmail
                email={profile.email}
                label={t("contactPage.copy")}
                done={t("contactPage.copied")}
                className={s.copy}
              />
            </div>
          )}
          <ul className={s.links} data-reveal>
            <li>
              <a className={s.plate} href={profile.links.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </li>
            <li>
              <a className={s.plate} href={profile.links.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </li>
          </ul>
          <p className={s.note}>{t("contactPage.form")}</p>
        </div>
      </Trunk>
    </main>
  );
}
