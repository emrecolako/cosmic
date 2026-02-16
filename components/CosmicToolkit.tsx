"use client";

import { motion } from "framer-motion";

interface CosmicToolkitProps {
  items: string[] | null;
  isLoading: boolean;
}

const COLORS = ["#d4a853", "#6c5ce7", "#00b894", "#d4a853", "#6c5ce7"];

export default function CosmicToolkit({ items, isLoading }: CosmicToolkitProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="grid gap-3">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card p-5 flex items-start gap-4 hover:border-opacity-50 transition-all"
          style={{ borderColor: `${COLORS[i % COLORS.length]}33` }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{
              backgroundColor: `${COLORS[i % COLORS.length]}15`,
              color: COLORS[i % COLORS.length],
            }}
          >
            {i + 1}
          </div>
          <p className="text-sm text-cream/70 leading-relaxed">{item}</p>
        </motion.div>
      ))}
    </div>
  );
}
