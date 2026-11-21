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
import { withBase } from "@/lib/paths";
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
  const url = (l: string) => `${site.origin}${withBase(`/${l}/`)}`;
  return {
    metadataBase: new URL(site.origin),
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: url(locale),
      languages: { ...Object.fromEntries(routing.locales.map((l) => [l, url(l)])), "x-default": url("en") },
    },
  };
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
          <CommandPalette links={{ github: profile.links.github, linkedin: profile.links.linkedin }} />
          <StationCursor
            className={cursor.cursor}
            plateClassName={cursor.plate}
            markClassName={cursor.mark}
            carClassName={cursor.car}
          />
          <RevealObserver />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
