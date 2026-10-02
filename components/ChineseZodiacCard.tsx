"use client";

import { useI18n } from "@/components/LocaleProvider";
import { formatMessage } from "@/lib/i18n";
import {
  enContent,
  type LocaleContent,
  type AnimalName,
  type ChineseElementName,
  type YinYangName,
} from "@/lib/i18n/content";
import type { ChineseZodiacProfile } from "@/lib/chinese-zodiac";

export default function ChineseZodiacCard({
  profile,
  content,
}: {
  profile: ChineseZodiacProfile;
  content: LocaleContent;
}) {
  const { t } = useI18n();
  const animalKey = profile.animal as AnimalName;
  const elementKey = profile.element as ChineseElementName;
  const yinYangKey = profile.yinYang as YinYangName;

  const animal = content.animalNames[animalKey] ?? profile.animal;
  const element = content.chineseElementNames[elementKey] ?? profile.element;
  const polarity = content.yinYang[yinYangKey] ?? profile.yinYang;
  const description =
    content.chineseAnimals[animalKey] ?? enContent.chineseAnimals[animalKey];
  const elementDescription =
    content.chineseElements[elementKey] ?? enContent.chineseElements[elementKey];
  const bestWith = profile.compatibility.bestWith.map(
    (item) => content.animalNames[item as AnimalName] ?? item
  );
  const challenging = profile.compatibility.challenging.map(
    (item) => content.animalNames[item as AnimalName] ?? item
  );

  return (
    <div className="eastern-composition">
      <div><h3 className="eastern-animal editorial">{animal}</h3><p className="eyebrow mt-6">{element} / {polarity}</p></div>
      <div className="eastern-copy"><p>{description}</p><div className="mt-7 border-t border-line-muted pt-6"><h4 className="eyebrow mb-3">{formatMessage(t.chinese.elementLabel, { element })}</h4><p>{elementDescription}</p></div></div>
    </div>
  );
}
