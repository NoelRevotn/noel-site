import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Trunk } from "@/components/ui/Stop";
import s from "./stub.module.css";

/** A station on the map that isn't built yet: says when it arrives and links home. */
export async function StubPage({ title, phase }: { title: string; phase: string }) {
  const t = await getTranslations("stub");
  return (
    <main id="main">
      <Trunk>
        <section className={s.stub} aria-labelledby="stub-title">
          <h1 id="stub-title" className={s.title}>
            {title}
          </h1>
          <p className={s.text}>
            {t("soon")} {t("phase", { phase })}
          </p>
          <Link href="/" className={s.home}>
            {t("home")}
          </Link>
        </section>
      </Trunk>
    </main>
  );
}
