import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LineCode, StationMark } from "@/components/ui/Stop";
import { NetworkMap3D } from "@/islands/network-map/NetworkMap3D";
import { DisplayControls } from "@/islands/settings/DisplayControls";
import { profile } from "@/lib/content";
import s from "./hero.module.css";

/** Hero: who, what, proof map, and the three actions (PLAN §4). Always first on the home page. */
export async function Hero() {
  const t = await getTranslations();
  const locale = (await getLocale()) as "en" | "es";
  return (
    <>
      <section className={s.hero} aria-labelledby="name">
        <NetworkMap3D
          className={s.map3d}
          labelClassName={s.label}
          fallbackClassName={s.map2d}
          hintClassName={s.hint}
          labels={{ role: t("map.role"), label: t("map.label"), hint: t("map.hint") }}
        />
        <div className={s.copy}>
          <h1 id="name" className={s.name}>
            {profile.name}
          </h1>
          <p className={s.headline}>{t("hero.headline")}</p>
          <p className={s.status}>
            <span className={s.pulse} aria-hidden="true" />
            {t("hero.status")}
          </p>
          <p className={s.place}>
            <span className="mono">{profile.coords}</span> {profile.location[locale]}
          </p>
          <ul className={s.actions}>
            <li>
              <Link prefetch={false} className={s.primary} href="/projects">
                {t("hero.viewProjects")}
              </Link>
            </li>
            <li>
              <Link prefetch={false} className={s.secondary} href="/cv">
                {t("hero.viewCv")}
              </Link>
            </li>
            <li>
              <Link prefetch={false} className={s.secondary} href="/contact">
                {t("hero.contact")}
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section className={s.legend} aria-label={t("legend.label")}>
        <ul className={s.lines}>
          <li>
            <LineCode line="ml">ML</LineCode> {t("legend.ml")}
          </li>
          <li>
            <LineCode line="sys">SY</LineCode> {t("legend.sys")}
          </li>
          <li>
            <LineCode line="web">WB</LineCode> {t("legend.web")}
          </li>
        </ul>
        <p className={s.key}>
          <StationMark /> {t("legend.built")}
          <StationMark built={false} /> {t("legend.inProgress")}
        </p>
        <DisplayControls
          className={s.controls}
          buttonClassName={s.toggle}
          labels={{
            group: t("settings.group"),
            dark: t("settings.dark"),
            pause: t("settings.pause"),
            motionOff: t("settings.motionOff"),
            motionOffHint: t("settings.motionOffHint"),
            cursor: t("settings.cursor"),
          }}
        />
      </section>
    </>
  );
}
