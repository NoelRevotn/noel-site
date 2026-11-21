import { getTranslations, setRequestLocale } from "next-intl/server";
import { StubPage } from "@/components/chrome/StubPage";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const phase = locale === "es" ? "Phase 3".replace("Phase", "fase") : "Phase 3";
  return <StubPage title={t("nav.projects")} phase={phase} />;
}
