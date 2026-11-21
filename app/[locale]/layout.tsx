import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { site, type Locale } from "../../site.config";

// Static export: every locale is pre-rendered at build time, and any other value is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return site.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Noel Echeverría",
  description: "Portfolio of Noel Echeverría, Systems & Computer Engineering student at UTP, Panama.",
};

function isLocale(value: string): value is Locale {
  return (site.locales as readonly string[]).includes(value);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
