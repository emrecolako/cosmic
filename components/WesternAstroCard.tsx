"use client";

import type { WesternAstrologyProfile } from "@/lib/western-astrology";
import type { LocaleContent } from "@/lib/i18n/content";
import { useI18n } from "@/components/LocaleProvider";
import { textGlyph } from "@/lib/utils";

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 sm:gap-8">
      <span className="w-28 sm:w-32 shrink-0 text-ink-muted uppercase">{label}</span>
      <span className="text-ink tabular-nums min-w-0 break-words">{value}</span>
    </div>
  );
}

export default function WesternAstroCard({ profile, content }: { profile: WesternAstrologyProfile; content: LocaleContent }) {
  const { t } = useI18n();
  const { sunSign, moonSign, risingSign } = profile;
  const localizedSun = content.signNames[sunSign.sign] ?? sunSign.sign;
  const localizedMoon = moonSign ? (content.signNames[moonSign] ?? moonSign) : null;
  const localizedRising = risingSign ? (content.signNames[risingSign] ?? risingSign) : null;
  const localizedDetails = content.zodiac[sunSign.sign];

  return (
    <div className="animate-fade-in-up">
      <div className="rounded-lg bg-panel p-4 font-mono text-xs tracking-wider mb-6">
        <div className="space-y-1.5">
          <ParamRow label={t.western.sunSign} value={`${localizedSun} · ${t.western.decan} ${sunSign.decan}`} />
          {localizedMoon && <ParamRow label={t.western.moonSign} value={localizedMoon} />}
          {localizedRising && <ParamRow label={t.western.risingSign} value={localizedRising} />}
          <ParamRow label={t.western.element} value={content.elementNames[sunSign.element] ?? sunSign.element} />
          <ParamRow label={t.western.modality} value={content.modalityNames[sunSign.modality] ?? sunSign.modality} />
          <ParamRow label={t.western.rulingPlanet} value={content.planetNames[sunSign.rulingPlanet] ?? sunSign.rulingPlanet} />
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl text-ink" role="img" aria-label={localizedSun}>{textGlyph(sunSign.glyph)}</span>
          <h3 className="text-lg font-medium text-ink">{localizedSun}</h3>
        </div>
        <p className="text-sm text-ink-secondary leading-relaxed mb-3">{localizedDetails?.description ?? sunSign.description}</p>
        <div className="font-mono text-xs uppercase tracking-wider text-ink-muted">
          {(localizedDetails?.traits ?? sunSign.traits).join(" · ")}
        </div>
      </div>

      {!moonSign && !risingSign && <p className="font-mono text-xs tracking-wider uppercase text-ink-muted mt-3">{t.western.birthTimeNote}</p>}
    </div>
  );
}
