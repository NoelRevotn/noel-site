import { getTranslations } from "next-intl/server";
import { Stop } from "@/components/ui/Stop";
import s from "./writing.module.css";

/** Latest posts. Empty until the MDX blog lands in Phase 4. */
export async function LatestWriting() {
  const t = await getTranslations();
  return (
    <Stop id="writing" title={t("sections.writing")}>
      <p className={s.empty} data-reveal>
        <span className={s.ring} aria-hidden="true" />
        {t("writing.empty")}
      </p>
    </Stop>
  );
}
