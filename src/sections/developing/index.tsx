import { getLocale, getTranslations } from "next-intl/server";
import { StationMark, Stop } from "@/components/ui/Stop";
import { developing } from "../../../content/developing";
import s from "./developing.module.css";

/** Growth areas, shown honestly as hollow (in-progress) stations. */
export async function Developing() {
  const t = await getTranslations();
  const locale = (await getLocale()) as "en" | "es";
  return (
    <Stop id="developing" title={t("sections.developing")}>
      <p className={s.intro}>{t("developing.intro")}</p>
      <ul className={s.list}>
        {developing.map((d, i) => (
          <li key={d.via} className={s.item} data-reveal style={{ "--reveal-i": i } as React.CSSProperties}>
            <StationMark built={false} />
            <span>
              <strong className={s.topic}>{d.topic[locale]}</strong>
              <span className={s.via}>
                {d.via} <span className="mono">{d.startedAt}</span>
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Stop>
  );
}
