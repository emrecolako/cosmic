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
    <div className="card p-5 animate-fade-in-up">
      <div className="flex items-start gap-5">
        <div className="text-5xl shrink-0 grayscale" role="img" aria-label={animal}>
          {profile.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-medium text-ink mb-1">
            {formatMessage(t.chinese.animalTitle, { animal })}
          </h3>

          <div className="font-mono text-xs uppercase tracking-wider text-ink-muted mb-3">
            {element} · {polarity}
          </div>

          <p className="text-sm text-ink-secondary leading-relaxed mb-4">
            {description}
          </p>

          <div className="rounded-lg bg-panel p-3 mb-4">
            <div className="font-mono text-xs text-ink-muted uppercase tracking-wider mb-1">
              {formatMessage(t.chinese.elementLabel, { element })}
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              {elementDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs tracking-wider">
            <div>
              <div className="text-ink-muted uppercase mb-1.5">
                {t.chinese.bestWith}
              </div>
              <div className="text-ink-secondary uppercase">
                {bestWith.join(" · ")}
              </div>
            </div>
            <div>
              <div className="text-ink-muted uppercase mb-1.5">
                {t.chinese.challenging}
              </div>
              <div className="text-ink-muted uppercase">
                {challenging.join(" · ")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
