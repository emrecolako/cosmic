"use client";

import { useI18n } from "@/components/LocaleProvider";
import {
  enContent,
  type LocaleContent,
  type SignName,
  type PlanetName,
} from "@/lib/i18n/content";
import type { WesternAstrologyProfile } from "@/lib/western-astrology";
import { textGlyph } from "@/lib/utils";

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(7rem,10rem)_1fr] gap-4">
      <span className="text-ink-muted uppercase">{label}</span>
      <span className="text-ink tabular-nums min-w-0 break-words">{value}</span>
    </div>
  );
}

export default function WesternAstroCard({
  profile,
  content,
}: {
  profile: WesternAstrologyProfile;
  content: LocaleContent;
}) {
  const { t } = useI18n();
  const { sunSign, moonSign, risingSign } = profile;
  const signKey = sunSign.sign as SignName;
  const localizedSign = content.signNames[signKey] ?? sunSign.sign;
  const localizedMoon = moonSign
    ? content.signNames[moonSign as SignName] ?? moonSign
    : null;
  const localizedRising = risingSign
    ? content.signNames[risingSign as SignName] ?? risingSign
    : null;
  const localizedElement = content.elementNames[sunSign.element] ?? sunSign.element;
  const localizedModality =
    content.modalityNames[sunSign.modality] ?? sunSign.modality;
  const localizedPlanet =
    content.planetNames[sunSign.rulingPlanet as PlanetName] ?? sunSign.rulingPlanet;
  const copy = content.zodiac[signKey] ?? enContent.zodiac[signKey];

  return (
    <div className="animate-fade-in-up">
      <div className="rounded-lg bg-panel p-4 font-mono text-xs tracking-wider mb-6">
        <div className="space-y-1.5">
          <ParamRow
            label={t.western.sunSign}
            value={`${localizedSign} · ${t.western.decan} ${sunSign.decan}`}
          />
          {localizedMoon && (
            <ParamRow label={t.western.moonSign} value={localizedMoon} />
          )}
          {localizedRising && (
            <ParamRow label={t.western.risingSign} value={localizedRising} />
          )}
          <ParamRow label={t.western.element} value={localizedElement} />
          <ParamRow label={t.western.modality} value={localizedModality} />
          <ParamRow label={t.western.rulingPlanet} value={localizedPlanet} />
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl text-ink" role="img" aria-label={localizedSign}>
            {textGlyph(sunSign.glyph)}
          </span>
          <h3 className="text-lg font-medium text-ink">{localizedSign}</h3>
        </div>

        <p className="text-sm text-ink-secondary leading-relaxed mb-3">
          {copy.description}
        </p>

        <div className="font-mono text-xs uppercase tracking-wider text-ink-muted">
          {copy.traits.join(" · ")}
        </div>
      </div>

      {!moonSign && !risingSign && (
        <p className="font-mono text-xs tracking-wider uppercase text-ink-muted mt-3">
          {t.western.birthTimeNote}
        </p>
      )}
    </div>
  );
}
