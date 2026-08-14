"use client";

import { motion } from "framer-motion";
import { t } from "@/lib/i18n";
import { textGlyph } from "@/lib/utils";

interface NatalChartVisualProps {
  sunSign: string;
  sunGlyph: string;
  moonSign: string | null;
  risingSign: string | null;
}

const SIGN_ORDER = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const SIGN_GLYPHS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const MONO = "var(--font-ibm-plex-mono), monospace";

export default function NatalChartVisual({
  sunSign,
  moonSign,
  risingSign,
}: NatalChartVisualProps) {
  const size = 320;
  const center = size / 2;
  const outerRadius = 140;
  const innerRadius = 100;
  const labelRadius = 120;

  const getAngleForSign = (sign: string): number => {
    const index = SIGN_ORDER.indexOf(sign);
    if (index === -1) return 0;
    return (index * 30 - 90) * (Math.PI / 180); // Start from top
  };

  const getPointOnCircle = (
    angle: number,
    radius: number
  ): { x: number; y: number } => ({
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  });

  const chartLabel = [
    `${t.western.chartSun}: ${sunSign}`,
    moonSign ? `${t.western.chartMoon}: ${moonSign}` : null,
    risingSign ? `${t.western.chartAsc}: ${risingSign}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full"
        role="img"
        aria-label={`${t.western.natalChart} — ${chartLabel}`}
      >
        <title>{`${t.western.natalChart} — ${chartLabel}`}</title>

        {/* Outer ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />

        {/* Inner ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="var(--border-muted)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
        />

        {/* Center point */}
        <circle cx={center} cy={center} r={2.5} fill="var(--text-muted)" />

        {/* House divisions */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const inner = getPointOnCircle(angle, innerRadius);
          const outer = getPointOnCircle(angle, outerRadius);
          return (
            <motion.line
              key={`house-${i}`}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--border-muted)"
              strokeWidth="0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.04 }}
            />
          );
        })}

        {/* Sign glyphs around the chart */}
        {SIGN_ORDER.map((sign, i) => {
          const angle = ((i * 30 + 15) - 90) * (Math.PI / 180);
          const pos = getPointOnCircle(angle, labelRadius);
          return (
            <motion.text
              key={sign}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fill={sign === sunSign ? "var(--text)" : "var(--text-muted)"}
              fontWeight={sign === sunSign ? "bold" : "normal"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.04 }}
            >
              {textGlyph(SIGN_GLYPHS[sign])}
            </motion.text>
          );
        })}

        {/* Sun position */}
        {(() => {
          const angle = getAngleForSign(sunSign) + (15 * Math.PI) / 180;
          const pos = getPointOnCircle(angle, innerRadius * 0.6);
          return (
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
            >
              <circle cx={pos.x} cy={pos.y} r={11} fill="var(--text)" opacity={0.12} />
              <circle cx={pos.x} cy={pos.y} r={5} fill="var(--text)" />
              <text
                x={pos.x}
                y={pos.y - 16}
                textAnchor="middle"
                fontSize="8"
                fill="var(--text)"
                fontFamily={MONO}
                letterSpacing="0.1em"
              >
                {t.western.chartSun}
              </text>
            </motion.g>
          );
        })()}

        {/* Moon position */}
        {moonSign &&
          (() => {
            const angle = getAngleForSign(moonSign) + (15 * Math.PI) / 180;
            const pos = getPointOnCircle(angle, innerRadius * 0.45);
            return (
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.15, type: "spring" }}
              >
                <circle cx={pos.x} cy={pos.y} r={9} fill="var(--text-secondary)" opacity={0.12} />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={4}
                  fill="none"
                  stroke="var(--text-secondary)"
                  strokeWidth="1.5"
                />
                <text
                  x={pos.x}
                  y={pos.y - 14}
                  textAnchor="middle"
                  fontSize="7"
                  fill="var(--text-secondary)"
                  fontFamily={MONO}
                  letterSpacing="0.1em"
                >
                  {t.western.chartMoon}
                </text>
              </motion.g>
            );
          })()}

        {/* Rising sign marker */}
        {risingSign &&
          (() => {
            const angle = getAngleForSign(risingSign);
            const pos = getPointOnCircle(angle, outerRadius + 12);
            return (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="8"
                  fill="var(--text-muted)"
                  fontFamily={MONO}
                  letterSpacing="0.1em"
                >
                  {t.western.chartAsc}
                </text>
              </motion.g>
            );
          })()}
      </svg>
    </motion.div>
  );
}
