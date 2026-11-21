import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/chrome/Footer";
import { routing } from "@/i18n/routing";
import { Backdrop } from "@/islands/backdrop/Backdrop";
import { CommandPalette } from "@/islands/command-palette/CommandPalette";
import cursor from "@/islands/cursor/cursor.module.css";
import { StationCursor } from "@/islands/cursor/StationCursor";
import { Rail } from "@/islands/rail/Rail";
import { RevealObserver } from "@/islands/reveal/RevealObserver";
import { fontVariables } from "@/lib/fonts";
import { pageMetadata, personJsonLd } from "@/lib/seo";
import { HEAD_SCRIPT } from "@/lib/theme-script";
import "@/styles/globals.css";
import { profile } from "../../content/profile";
import { site } from "../../site.config";

// Static export: every locale is pre-rendered at build time, and any other value is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { ...pageMetadata(locale, "/", t("title"), t("description")), metadataBase: new URL(site.origin) };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(locale)) }}
        />
      </head>
      <body>
        <Backdrop className={cursor.backdrop} />
        <NextIntlClientProvider>
          <a className="skip-link" href="#main">
            {t("skip")}
          </a>
          <Rail />
          {children}
          <Footer />
          <CommandPalette
            links={{ github: profile.links.github, linkedin: profile.links.linkedin }}
            email={profile.email}
          />
          <StationCursor
            className={cursor.cursor}
            plateClassName={cursor.plate}
            markClassName={cursor.mark}
            carClassName={cursor.car}
            dotClassName={cursor.dot}
          />
          <RevealObserver />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
