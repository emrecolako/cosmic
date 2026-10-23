"use client";

import { motion } from "framer-motion";
import type { FullWheel } from "@/lib/chart/view";
import { SIGNS, type Planet } from "@/lib/chart/types";
import { starMapCopy } from "@/lib/i18n/star-map";
import { textGlyph } from "@/lib/utils";

const SIZE = 320;
const C = SIZE / 2;
const R_OUT = 140;
const R_SIGN = 118;
const R_HOUSE = 100;
const R_PLANET = [84, 66];
const R_IN = 46;
const MONO = "var(--font-mono)";
const SIGN_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const PLANET_GLYPHS: Record<Planet, string> = { sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂", jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇" };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const ordinal = (h: number) => ({ 1: "1st", 2: "2nd", 3: "3rd" } as Record<number, string>)[h] ?? `${h}th`;

/** Ecliptic longitude → point, with `ref` at 9 o'clock and the zodiac running counter-clockwise. */
function point(lon: number, ref: number, r: number) {
  const phi = ((180 + lon - ref) * Math.PI) / 180;
  return { x: C + r * Math.cos(phi), y: C - r * Math.sin(phi) };
}

/** Nearby markers alternate onto an inner radius so glyphs don't overlap. */
function placeMarkers(bodies: FullWheel["bodies"]) {
  const sorted = [...bodies].sort((a, b) => a.lon - b.lon);
  const lastOnRing = [-Infinity, -Infinity];
  return sorted.map((b) => {
    const ring = b.lon - lastOnRing[0] < 9 && b.lon - lastOnRing[1] >= 9 ? 1 : 0;
    lastOnRing[ring] = b.lon;
    return { ...b, r: R_PLANET[ring] };
  });
}

function Rings() {
  return <>
    <motion.circle cx={C} cy={C} r={R_OUT} fill="none" stroke="var(--gold)" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeInOut" }} />
    <motion.circle cx={C} cy={C} r={R_SIGN} fill="none" stroke="var(--border-muted)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.2 }} />
    <motion.circle cx={C} cy={C} r={R_IN} fill="none" stroke="var(--border-muted)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.3 }} />
  </>;
}

function HouseLines({ ref0, cusps }: { ref0: number; cusps: number[] }) {
  return <>{cusps.map((lon, i) => {
    const a = point(lon, ref0, R_IN);
    const b = point(lon, ref0, R_OUT);
    return <motion.line key={`cusp-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--border-muted)" strokeWidth="0.75" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.04 }} />;
  })}</>;
}

/**
 * Locked: house divisions only, with a blurred placeholder where markers go.
 * It encodes nothing beyond the free view (no signs, degrees or placements).
 */
export function LockedStarMapWheel() {
  const cusps = Array.from({ length: 12 }, (_, i) => i * 30);
  const decoys = [20, 75, 110, 160, 205, 250, 290, 330];
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex justify-center">
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="max-w-full" role="img" aria-label={starMapCopy.wheelLockedLabel}>
      <title>{starMapCopy.wheelLockedLabel}</title>
      <Rings />
      <HouseLines ref0={0} cusps={cusps} />
      <g aria-hidden="true" style={{ filter: "blur(4px)" }} opacity={0.5}>
        {decoys.map((lon, i) => {
          const p = point(lon, 0, R_PLANET[i % 2]);
          return <circle key={lon} cx={p.x} cy={p.y} r={5} fill="var(--text)" />;
        })}
      </g>
    </svg>
  </motion.div>;
}

export default function StarMapWheel({ wheel }: { wheel: FullWheel }) {
  const solar = wheel.mode === "solar";
  const firstCusp = SIGNS.indexOf(wheel.firstHouseSign) * 30;
  const ref0 = solar || wheel.asc === undefined ? firstCusp : wheel.asc;
  const cusps = Array.from({ length: 12 }, (_, i) => (firstCusp + i * 30) % 360);
  const markers = placeMarkers(wheel.bodies);
  const label = `${starMapCopy.wheelLabel}: ${wheel.bodies.map((b) => `${cap(b.planet)} in the ${ordinal(b.house)} house${solar ? " (solar)" : ""}`).join(", ")}`;
  const axis = (lon: number, text: string, strong: boolean) => {
    const a = point(lon, ref0, R_OUT);
    const b = point(lon + 180, ref0, R_OUT);
    const t = point(lon, ref0, R_OUT + 12);
    return <g key={text}>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--text-muted)" strokeWidth={strong ? 1.4 : 1} strokeDasharray={strong ? undefined : "3 3"} />
      <text x={t.x} y={t.y} textAnchor="middle" dominantBaseline="central" fontSize="8" fill="var(--text-muted)" fontFamily={MONO} letterSpacing="0.1em">{text}</text>
    </g>;
  };

  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center">
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="max-w-full" role="img" aria-label={label}>
      <title>{label}</title>
      <Rings />
      <HouseLines ref0={ref0} cusps={cusps} />
      {cusps.map((lon, i) => {
        const glyphAt = point(lon + 15, ref0, (R_OUT + R_SIGN) / 2);
        const numberAt = point(lon + 15, ref0, (R_SIGN + R_HOUSE) / 2 - 2);
        return <g key={`house-${i}`}>
          <text x={glyphAt.x} y={glyphAt.y} textAnchor="middle" dominantBaseline="central" fontSize="11" fill="var(--text-muted)">{textGlyph(SIGN_GLYPHS[Math.floor(lon / 30)])}</text>
          <text x={numberAt.x} y={numberAt.y} textAnchor="middle" dominantBaseline="central" fontSize="8" fill="var(--text-muted)" fontFamily={MONO}>{i + 1}</text>
        </g>;
      })}
      {!solar && wheel.asc !== undefined && axis(wheel.asc, "ASC", true)}
      {!solar && wheel.mc !== undefined && axis(wheel.mc, "MC", false)}
      {markers.map((m, i) => {
        const p = point(m.lon, ref0, m.r);
        return <motion.g key={m.planet} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 + i * 0.05 }}>
          <circle cx={p.x} cy={p.y} r={9} fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="0.75" />
          <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="11" fill={m.planet === "sun" || m.planet === "moon" ? "var(--text)" : "var(--text-secondary)"}>{textGlyph(PLANET_GLYPHS[m.planet])}</text>
        </motion.g>;
      })}
    </svg>
    <ul className="wheel-legend" aria-hidden="true">
      {wheel.bodies.map((b) => <li key={b.planet}><span>{textGlyph(PLANET_GLYPHS[b.planet])}</span> {cap(b.planet)}</li>)}
      {!solar && wheel.asc !== undefined && <li><span>ASC</span> Rising</li>}
      {!solar && wheel.mc !== undefined && <li><span>MC</span> Midheaven</li>}
    </ul>
  </motion.div>;
}
