"use client";

import type { WesternAstrologyProfile } from "@/lib/western-astrology";
import { t } from "@/lib/i18n";
import { textGlyph } from "@/lib/utils";

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-8">
      <span className="w-32 shrink-0 text-ink-muted uppercase">{label}</span>
      <span className="text-ink tabular-nums">{value}</span>
    </div>
  );
}

export default function WesternAstroCard({ profile }: { profile: WesternAstrologyProfile }) {
  const { sunSign, moonSign, risingSign } = profile;

  return (
    <div className="animate-fade-in-up">
      {/* PARAMETERS-style data block */}
      <div className="rounded-lg bg-panel p-4 font-mono text-xs tracking-wider mb-6">
        <div className="space-y-1.5">
          <ParamRow
            label={t.western.sunSign}
            value={`${sunSign.sign} · ${t.western.decan} ${sunSign.decan}`}
          />
          {moonSign && <ParamRow label={t.western.moonSign} value={moonSign} />}
          {risingSign && <ParamRow label={t.western.risingSign} value={risingSign} />}
          <ParamRow label={t.western.element} value={sunSign.element} />
          <ParamRow label={t.western.modality} value={sunSign.modality} />
          <ParamRow label={t.western.rulingPlanet} value={sunSign.rulingPlanet} />
        </div>
      </div>

      {/* Sun sign details */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl text-ink" role="img" aria-label={sunSign.sign}>
            {textGlyph(sunSign.glyph)}
          </span>
          <h3 className="text-lg font-medium text-ink">{sunSign.sign}</h3>
        </div>

        <p className="text-sm text-ink-secondary leading-relaxed mb-3">{sunSign.description}</p>

        <div className="font-mono text-xs uppercase tracking-wider text-ink-muted">
          {sunSign.traits.join(" · ")}
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
