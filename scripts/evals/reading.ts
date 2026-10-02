/** Evaluate a completed English OpenRouter reading without sending it anywhere. */
import { readFileSync } from "node:fs";
import { parseAnalysis } from "../../lib/analysis-stream";

export interface EvalFixture {
  scope: "snapshot" | "full";
  locale: "en";
  birthTimeKnown: boolean;
  facts: {
    lifePath: number;
    sunSign: string;
    chineseAnimal: string;
    personalYear: number;
    moonSign?: string;
    risingSign?: string;
  };
  /** Words relevant to the selected life context; at least one should appear. */
  lifeStageTerms: string[];
}

export interface EvalResult {
  passed: boolean;
  checks: { id: string; passed: boolean; detail: string }[];
  metrics: Record<string, number>;
  review: string[];
}

const MARKER = /^<<<(SNAPSHOT|READING|SEASON|TOOLKIT)>>>$/gm;
const SIGNS = "Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces";
const ANIMALS = "Rat|Ox|Tiger|Rabbit|Dragon|Snake|Horse|Goat|Monkey|Rooster|Dog|Pig";
const words = (s: string) => s.trim().match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
const contains = (s: string, term: string) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(s);

export function evaluateReading(output: string, fixture: EvalFixture): EvalResult {
  if (fixture.locale !== "en") throw new Error("This eval currently supports English output only");
  const checks: EvalResult["checks"] = [];
  const add = (id: string, passed: boolean, detail: string) => checks.push({ id, passed, detail });
  const expected = fixture.scope === "full" ? ["SNAPSHOT", "READING", "SEASON", "TOOLKIT"] : ["SNAPSHOT"];
  const found = [...output.matchAll(MARKER)].map((m) => m[1]);
  const allMarkers = [...output.matchAll(/<<<(SNAPSHOT|READING|SEASON|TOOLKIT)>>>/g)].map((m) => m[1]);
  add("marker_order", JSON.stringify(found) === JSON.stringify(expected) && JSON.stringify(allMarkers) === JSON.stringify(expected), `Expected ${expected.join(" → ")}; found ${allMarkers.join(" → ") || "none"}`);
  add("no_preamble", output.trimStart().startsWith("<<<SNAPSHOT>>>"), "First text must be the snapshot marker");
  const parsed = parseAnalysis(output);
  const snapshot = parsed.cosmicSnapshot ?? "";
  const reading = parsed.combinedAnalysis ?? "";
  const season = parsed.currentSeason ?? "";
  const toolkitRaw = output.split(/^<<<TOOLKIT>>>$/m)[1]?.trim() ?? "";
  const toolkitLines = toolkitRaw ? toolkitRaw.split(/\r?\n/).filter((s) => s.trim()) : [];
  add("snapshot_present", words(snapshot) >= 20 && words(snapshot) <= 100, `Snapshot: ${words(snapshot)} words (expected 20–100)`);
  if (fixture.scope === "full") {
    add("reading_length", words(reading) >= 800 && words(reading) <= 1200, `Reading: ${words(reading)} words (expected 800–1200)`);
    add("reading_headings", (reading.match(/^##\s+\S.+$/gm) ?? []).length === 3, "Reading needs three ## subheadings");
    add("season_length", words(season) >= 150 && words(season) <= 200, `Season: ${words(season)} words (expected 150–200)`);
    add("toolkit", toolkitLines.length >= 3 && toolkitLines.length <= 5 && toolkitLines.every((line) => /^- \S/.test(line)), `Toolkit: ${toolkitLines.length} lines, each must start with '- ' (expected 3–5)`);
  }

  const all = [snapshot, reading, season, toolkitRaw].join("\n");
  const core = [snapshot, reading].join("\n");
  const { facts } = fixture;
  const anchors = [contains(core, facts.sunSign), contains(core, facts.chineseAnimal), new RegExp(`\\b(?:life path|life-path)\\s*(?:number\\s*)?${facts.lifePath}\\b`, "i").test(core)];
  add("core_anchors", anchors.filter(Boolean).length >= (fixture.scope === "full" ? 3 : 2), `Snapshot/reading must mention ${fixture.scope === "full" ? "all three" : "at least two"} supplied system anchors`);
  const wrongLifePath = [...all.matchAll(/\b(?:life path|life-path)\s*(?:number\s*)?(\d{1,2})\b/gi)].map((m) => Number(m[1])).filter((n) => n !== facts.lifePath);
  add("life_path_grounding", wrongLifePath.length === 0, `Incorrect Life Path claims: ${wrongLifePath.join(", ") || "none"}`);
  const wrongSun = [...all.matchAll(new RegExp(`\\b(?:your |their )?sun (?:sign )?(?:is|in|as)\\s+(${SIGNS})\\b`, "gi"))].map((m) => m[1]).filter((s) => s.toLowerCase() !== facts.sunSign.toLowerCase());
  add("sun_grounding", wrongSun.length === 0, `Incorrect Sun sign claims: ${wrongSun.join(", ") || "none"}`);
  const wrongAnimal = [...all.matchAll(new RegExp(`\\b(?:your|their)\\s+(?:chinese\\s+)?(?:zodiac|animal|sign)\\s+(?:is|:)\\s+(?:an?\\s+)?(${ANIMALS})\\b`, "gi"))].map((m) => m[1]).filter((animal) => animal.toLowerCase() !== facts.chineseAnimal.toLowerCase());
  add("animal_grounding", wrongAnimal.length === 0, `Incorrect Chinese animal claims: ${wrongAnimal.join(", ") || "none"}`);
  for (const [label, expectedSign] of [["moon", facts.moonSign], ["rising", facts.risingSign]] as const) {
    if (!expectedSign) continue;
    const wrong = [...all.matchAll(new RegExp(`\\b(?:your |their )?${label} (?:sign )?(?:is|in|as)\\s+(${SIGNS})\\b`, "gi"))].map((m) => m[1]).filter((s) => s.toLowerCase() !== expectedSign.toLowerCase());
    add(`${label}_grounding`, wrong.length === 0, `Incorrect ${label} sign claims: ${wrong.join(", ") || "none"}`);
  }
  if (!fixture.birthTimeKnown) {
    const personalSignClaim = new RegExp(`\\b(?:your|their)?\\s*(?:moon sign|rising sign|ascendant|moon|rising)\\s+(?:is|in|as|:)\\s+(?:an?\\s+)?(${SIGNS})\\b`, "i").test(all);
    const personalHouseClaim = /\b(?:your|their)\s+(?:\w+\s+){0,2}(?:is|sits|falls|lands)\s+in\s+(?:the\s+)?\d+(?:st|nd|rd|th)\s+house\b/i.test(all);
    add("unknown_time", !personalSignClaim && !personalHouseClaim, "No personal Moon, rising, ascendant, or house claim when time is unknown");
  }
  add("no_unsupported_precision", !/\b(?:current|today'?s|this (?:week|month|year)'?s)\s+(?:planetary\s+)?(?:transit|aspect|conjunction|opposition|trine)s?\b|\b(?:in|through|enters?|occupies?)\s+(?:the\s+)?\d+(?:st|nd|rd|th)\s+house\b|\b\d{1,2}°\b/i.test(all), "No uncalculated transits, aspects, house positions, or degrees");
  if (fixture.scope === "full") {
    add("personal_year", new RegExp(`\\b(?:personal year|year)\\s*(?:number\\s*)?${facts.personalYear}\\b`, "i").test(season), `Season should ground timing in Personal Year ${facts.personalYear}`);
    add("life_stage", fixture.lifeStageTerms.length > 0 && fixture.lifeStageTerms.some((term) => contains([reading, toolkitRaw].join(" "), term)), `Expected at least one life-stage term: ${fixture.lifeStageTerms.join(", ")}`);
  }
  return {
    passed: checks.every((c) => c.passed),
    checks,
    metrics: { snapshotWords: words(snapshot), readingWords: words(reading), seasonWords: words(season), toolkitItems: toolkitLines.length },
    review: [
      "Synthesis (0–2): Does it connect all three systems into a coherent insight, rather than list traits?",
      "Specificity (0–2): Are claims grounded in the supplied facts and personal context, with no fabricated details?",
      "Tension (0–2): Does it explore a meaningful tension without treating either system as deterministic?",
      "Usefulness (0–2): Are at least three takeaways concrete actions suited to this life stage?",
      "Voice (0–2): Is the writing warm, clear, nonfatalistic, and free of stock horoscope language?",
    ],
  };
}

if (process.argv[1]?.endsWith("reading.ts")) {
  const [, , outputPath, fixturePath] = process.argv;
  if (!outputPath || !fixturePath) {
    console.error("Usage: npx tsx scripts/evals/reading.ts OUTPUT.txt FIXTURE.json");
    process.exit(2);
  }
  try {
    const result = evaluateReading(readFileSync(outputPath, "utf8"), JSON.parse(readFileSync(fixturePath, "utf8")) as EvalFixture);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.passed ? 0 : 1);
  } catch (error) {
    console.error(error);
    process.exit(2);
  }
}
