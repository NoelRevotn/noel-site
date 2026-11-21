import { setRequestLocale } from "next-intl/server";
import { Trunk } from "@/components/ui/Stop";
import { Hero } from "@/sections/hero";
import { registry } from "@/sections/registry";
import { home } from "../../site.config";

/** Home: the hero, then every enabled section from site.config.ts as a stop on the trunk. */
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main id="main">
      <Hero />
      <Trunk>
        {home
          .filter((s) => s.enabled)
          .map((s) => {
            const Section = registry[s.id];
            return <Section key={s.id} {...("props" in s ? s.props : {})} />;
          })}
      </Trunk>
    </main>
  );
}
