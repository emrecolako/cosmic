"use client";

import { motion } from "framer-motion";
import type { ChineseZodiacProfile } from "@/lib/chinese-zodiac";

interface ChineseZodiacCardProps {
  profile: ChineseZodiacProfile;
}

export default function ChineseZodiacCard({ profile }: ChineseZodiacCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex items-start gap-5">
        {/* Animal emoji */}
        <div className="text-6xl shrink-0">{profile.emoji}</div>

        <div className="min-w-0 flex-1">
          <h3
            className="text-2xl font-semibold text-cream mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            The {profile.animal}
          </h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs px-3 py-1 rounded-full bg-teal/10 text-teal border border-teal/20">
              {profile.element}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-purple/10 text-purple border border-purple/20">
              {profile.yinYang}
            </span>
          </div>

          <p className="text-sm text-cream/60 leading-relaxed mb-4">
            {profile.description}
          </p>

          {/* Element description */}
          <div className="p-3 rounded-lg bg-navy/40 border border-navy-border mb-4">
            <div className="text-xs text-cream/40 uppercase tracking-wider mb-1">
              {profile.element} Element
            </div>
            <p className="text-xs text-cream/50 leading-relaxed">
              {profile.elementDescription}
            </p>
          </div>

          {/* Compatibility */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-cream/40 uppercase tracking-wider mb-1.5">
                Best With
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.compatibility.bestWith.map((animal) => (
                  <span
                    key={animal}
                    className="text-xs px-2 py-0.5 rounded-full bg-teal/10 text-teal/80"
                  >
                    {animal}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-cream/40 uppercase tracking-wider mb-1.5">
                Challenging
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.compatibility.challenging.map((animal) => (
                  <span
                    key={animal}
                    className="text-xs px-2 py-0.5 rounded-full bg-navy-border text-cream/40"
                  >
                    {animal}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
