"use client";

import { motion } from "framer-motion";

interface NumerologyCardProps {
  label: string;
  number: number;
  title: string;
  brief: string;
  keywords: string[];
  delay?: number;
}

export default function NumerologyCard({
  label,
  number,
  title,
  brief,
  keywords,
  delay = 0,
}: NumerologyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-6 group hover:border-gold/30 transition-all duration-300"
    >
      <div className="text-xs text-cream/40 uppercase tracking-wider mb-3 font-medium">
        {label}
      </div>

      <div className="flex items-start gap-4">
        <div
          className="text-5xl font-bold text-gold glow-gold shrink-0"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {number}
        </div>

        <div className="min-w-0">
          <h3
            className="text-lg font-semibold text-cream mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {title}
          </h3>
          <p className="text-sm text-cream/60 leading-relaxed mb-3">
            {brief}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="text-xs px-2 py-0.5 rounded-full bg-purple/10 text-purple border border-purple/20"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
