import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Trunk } from "@/components/ui/Stop";
import { PageTitle } from "@/components/ui/Text";
import { ContactForm } from "@/islands/contact-form/ContactForm";
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
          {/* Public by design: a Web3Forms access key only lets the form deliver to Noel's inbox (ADR-0005). */}
          {process.env.NEXT_PUBLIC_WEB3FORMS_KEY ? (
            <ContactForm
              accessKey={process.env.NEXT_PUBLIC_WEB3FORMS_KEY}
              labels={{
                title: t("form.title"),
                name: t("form.name"),
                email: t("form.email"),
                message: t("form.message"),
                submit: t("form.submit"),
                sending: t("form.sending"),
                sent: t("form.sent"),
                error: t("form.error"),
                required: t("form.required"),
                invalidEmail: t("form.invalidEmail"),
                tooShort: t("form.tooShort"),
                privacy: t("form.privacy"),
                captcha: t("form.captcha"),
              }}
            />
          ) : (
            <p className={s.note}>{t("form.unavailable")}</p>
          )}
        </div>
      </Trunk>
    </main>
  );
}
