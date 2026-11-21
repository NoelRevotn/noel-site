import { getLocale, getTranslations } from "next-intl/server";
import { LineIcon } from "@/components/icons/LineIcon";
import { Chip, Chips, Scene } from "@/components/scene/Scene";
import { StationMark } from "@/components/ui/Stop";
import { developing } from "@/lib/content";

/** Growth areas as hollow (in-progress) stations: one chip each. */
export async function Developing() {
  const t = await getTranslations();
  const locale = (await getLocale()) as "en" | "es";
  return (
    <Scene id="developing" title={t("home.developing")} icon={<LineIcon name="learn" />}>
      <Chips label={t("sections.developing")}>
        {developing.map((d) => (
          <Chip key={d.via + d.topic.en} mark={<StationMark built={false} />}>
            {d.topic[locale]}
          </Chip>
        ))}
      </Chips>
    </Scene>
  );
}
