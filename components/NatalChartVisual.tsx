"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/components/I18nProvider";

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
  Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A", Cancer: "\u264B",
  Leo: "\u264C", Virgo: "\u264D", Libra: "\u264E", Scorpio: "\u264F",
  Sagittarius: "\u2650", Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
};

export default function NatalChartVisual({
  sunSign,
  moonSign,
  risingSign,
}: NatalChartVisualProps) {
  const { t } = useI18n();
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="flex justify-center"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full"
      >
        {/* Outer ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="#1e2249"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Inner ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="#1e2249"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
        />

        {/* Center point */}
        <circle cx={center} cy={center} r={3} fill="#d4a853" opacity={0.5} />

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
              stroke="#1e2249"
              strokeWidth="0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
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
              fill={sign === sunSign ? "#d4a853" : "#4a4e7a"}
              fontWeight={sign === sunSign ? "bold" : "normal"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.05 }}
            >
              {SIGN_GLYPHS[sign]}
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
              transition={{ delay: 1.2, type: "spring" }}
            >
              <circle cx={pos.x} cy={pos.y} r={12} fill="#d4a853" opacity={0.2} />
              <circle cx={pos.x} cy={pos.y} r={6} fill="#d4a853" />
              <text
                x={pos.x}
                y={pos.y - 18}
                textAnchor="middle"
                fontSize="8"
                fill="#d4a853"
                fontWeight="600"
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
                transition={{ delay: 1.4, type: "spring" }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={10}
                  fill="#6c5ce7"
                  opacity={0.2}
                />
                <circle cx={pos.x} cy={pos.y} r={5} fill="#6c5ce7" />
                <text
                  x={pos.x}
                  y={pos.y - 15}
                  textAnchor="middle"
                  fontSize="7"
                  fill="#6c5ce7"
                  fontWeight="600"
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
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              >
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="8"
                  fill="#00b894"
                  fontWeight="600"
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
