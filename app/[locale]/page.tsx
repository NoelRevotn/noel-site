import { Fragment } from "react";
import { setRequestLocale } from "next-intl/server";
import { TrackDivider } from "@/components/scene/Scene";
import { Hero } from "@/sections/hero";
import { registry } from "@/sections/registry";
import { home } from "../../site.config";
import s from "./home.module.css";

const LINES = ["ml", "sys", "web"] as const;

/** Home: the hero, then every enabled section from site.config.ts, one idea per screen. */
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main id="main">
      <Hero />
      <div className={s.scenes}>
        {home
          .filter((sec) => sec.enabled)
          .map((sec, i) => {
            const Section = registry[sec.id];
            return (
              <Fragment key={sec.id}>
                {i > 0 && <TrackDivider line={LINES[i % LINES.length]!} />}
                <Section {...("props" in sec ? sec.props : {})} />
              </Fragment>
            );
          })}
      </div>
    </main>
  );
}
