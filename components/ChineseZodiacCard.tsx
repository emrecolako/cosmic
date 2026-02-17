"use client";

import { motion } from "framer-motion";
import type { ChineseZodiacProfile } from "@/lib/chinese-zodiac";
import { useI18n } from "@/components/I18nProvider";

interface ChineseZodiacCardProps {
  profile: ChineseZodiacProfile;
}

export default function ChineseZodiacCard({ profile }: ChineseZodiacCardProps) {
  const { t, locale } = useI18n();

  const animalName = t.animals[profile.animal as keyof typeof t.animals] || profile.animal;
  const elementName = t.elements[profile.element as keyof typeof t.elements] || profile.element;
  const yinYangName = t.yinYang[profile.yinYang as keyof typeof t.yinYang] || profile.yinYang;

  const description = (locale === "tr" && t.animalDescriptions)
    ? (t.animalDescriptions[profile.animal as keyof typeof t.animalDescriptions] || profile.description)
    : profile.description;

  const elementDescription = (locale === "tr" && t.elementDescriptions)
    ? (t.elementDescriptions[profile.element as keyof typeof t.elementDescriptions] || profile.elementDescription)
    : profile.elementDescription;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex items-start gap-5">
        <div className="text-6xl shrink-0">{profile.emoji}</div>

        <div className="min-w-0 flex-1">
          <h3
            className="text-2xl font-semibold text-cream mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.chinese.the}{animalName}
          </h3>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs px-3 py-1 rounded-full bg-teal/10 text-teal border border-teal/20">
              {elementName}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-purple/10 text-purple border border-purple/20">
              {yinYangName}
            </span>
          </div>

          <p className="text-sm text-cream/60 leading-relaxed mb-4">{description}</p>

          <div className="p-3 rounded-lg bg-navy/40 border border-navy-border mb-4">
            <div className="text-xs text-cream/40 uppercase tracking-wider mb-1">
              {elementName} {t.chinese.elementLabel}
            </div>
            <p className="text-xs text-cream/50 leading-relaxed">{elementDescription}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-cream/40 uppercase tracking-wider mb-1.5">
                {t.chinese.bestWith}
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.compatibility.bestWith.map((animal) => (
                  <span key={animal} className="text-xs px-2 py-0.5 rounded-full bg-teal/10 text-teal/80">
                    {t.animals[animal as keyof typeof t.animals] || animal}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-cream/40 uppercase tracking-wider mb-1.5">
                {t.chinese.challenging}
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.compatibility.challenging.map((animal) => (
                  <span key={animal} className="text-xs px-2 py-0.5 rounded-full bg-navy-border text-cream/40">
                    {t.animals[animal as keyof typeof t.animals] || animal}
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
