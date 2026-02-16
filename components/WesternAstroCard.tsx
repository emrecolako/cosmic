"use client";

import { motion } from "framer-motion";
import type { WesternAstrologyProfile } from "@/lib/western-astrology";

interface WesternAstroCardProps {
  profile: WesternAstrologyProfile;
}

function SignBadge({
  label,
  value,
  glyph,
  color,
}: {
  label: string;
  value: string;
  glyph?: string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
      style={{
        borderColor: `${color}33`,
        backgroundColor: `${color}0a`,
      }}
    >
      {glyph && <span className="text-2xl">{glyph}</span>}
      <div>
        <div className="text-xs text-cream/40 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-sm font-semibold text-cream">{value}</div>
      </div>
    </div>
  );
}

export default function WesternAstroCard({ profile }: WesternAstroCardProps) {
  const { sunSign, moonSign, risingSign } = profile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Sign badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <SignBadge
          label="Sun Sign"
          value={`${sunSign.sign} (Decan ${sunSign.decan})`}
          glyph={sunSign.glyph}
          color="#d4a853"
        />
        {moonSign && (
          <SignBadge label="Moon Sign" value={moonSign} color="#6c5ce7" />
        )}
        {risingSign && (
          <SignBadge label="Rising Sign" value={risingSign} color="#00b894" />
        )}
      </div>

      {/* Sun sign details */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{sunSign.glyph}</span>
          <div>
            <h3
              className="text-xl font-semibold text-cream"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {sunSign.sign}
            </h3>
            <div className="flex gap-2 text-xs text-cream/50">
              <span className="px-2 py-0.5 rounded-full bg-navy-border">
                {sunSign.element}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-navy-border">
                {sunSign.modality}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-navy-border">
                {sunSign.rulingPlanet}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-cream/60 leading-relaxed mb-4">
          {sunSign.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {sunSign.traits.map((trait) => (
            <span
              key={trait}
              className="text-xs px-3 py-1 rounded-full bg-gold/10 text-gold/80 border border-gold/20"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {!moonSign && !risingSign && (
        <p className="text-xs text-cream/30 mt-3 italic">
          Provide your birth time and place for moon sign, rising sign, and
          more precise readings.
        </p>
      )}
    </motion.div>
  );
}
