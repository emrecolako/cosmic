"use client";

import type { ChineseZodiacProfile } from "@/lib/chinese-zodiac";
import { t } from "@/lib/i18n";

export default function ChineseZodiacCard({ profile }: { profile: ChineseZodiacProfile }) {
  return (
    <div className="card p-5 animate-fade-in-up">
      <div className="flex items-start gap-5">
        {/* Animal emoji are colour-only glyphs; desaturate to hold the monochrome palette. */}
        <div className="text-5xl shrink-0 grayscale" role="img" aria-label={profile.animal}>
          {profile.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-medium text-ink mb-1">
            {t.chinese.the}
            {profile.animal}
          </h3>

          <div className="font-mono text-xs uppercase tracking-wider text-ink-muted mb-3">
            {profile.element} · {profile.yinYang}
          </div>

          <p className="text-sm text-ink-secondary leading-relaxed mb-4">{profile.description}</p>

          <div className="rounded-lg bg-panel p-3 mb-4">
            <div className="font-mono text-xs text-ink-muted uppercase tracking-wider mb-1">
              {profile.element} {t.chinese.elementLabel}
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">{profile.elementDescription}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs tracking-wider">
            <div>
              <div className="text-ink-muted uppercase mb-1.5">{t.chinese.bestWith}</div>
              <div className="text-ink-secondary uppercase">
                {profile.compatibility.bestWith.join(" · ")}
              </div>
            </div>
            <div>
              <div className="text-ink-muted uppercase mb-1.5">{t.chinese.challenging}</div>
              <div className="text-ink-muted uppercase">
                {profile.compatibility.challenging.join(" · ")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
