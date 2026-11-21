import { getTranslations, setRequestLocale } from "next-intl/server";
import { StubPage } from "@/components/chrome/StubPage";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const phase = locale === "es" ? "Phase 4".replace("Phase", "fase") : "Phase 4";
  return <StubPage title={t("nav.blog")} phase={phase} />;
}
