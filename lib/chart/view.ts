/**
 * Star Map payload types shared by the API route and the client. Type-only:
 * no library text lives in this module.
 */
import type { ChartMode, Planet, Sign } from "./types";

export type LockedSection = "moon_house" | "venus_house" | "partnership" | "career";

interface StarMapBase {
  mode: ChartMode;
  /** Solar-chart explanation from rules.json; null for a full chart. */
  label: string | null;
  approximate: boolean;
}

export interface StarMapPreview extends StarMapBase {
  access: "preview";
  teaser: string | null;
  firstTeaser: { title: string; text: string; lockedSentences: number; slot: "sun_house" | "first" } | null;
  lockedCards: { section: LockedSection; label: string; title: string }[];
  moreCount: number;
  cta: string;
  wheel: { variant: "locked" };
}

export interface WheelBody { planet: Planet; lon: number; house: number }
export interface FullWheel {
  variant: "full";
  mode: ChartMode;
  firstHouseSign: Sign;
  asc?: number;
  mc?: number;
  bodies: WheelBody[];
}

export interface StarMapFull extends StarMapBase {
  access: "full";
  paragraphs: { slot: string; id: string; title: string; text: string; shareLine: string }[];
  tensions: string[];
  more: { id: string; text: string }[];
  notes: string[];
  chartRulerTitle: string;
  wheel: FullWheel;
}

/** Solar chart whose Sun changed sign that day: the houses can't be counted, so none are sent. */
export interface StarMapUnavailable extends StarMapBase {
  access: "none";
  reason: "sun_unstable";
}

export type StarMapView = StarMapPreview | StarMapFull | StarMapUnavailable;
