import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { evaluateReading, type EvalFixture } from "./reading";
import { computeChart } from "../../lib/chart/houses";
import { PLANETS } from "../../lib/chart/types";

const fixture: EvalFixture = {
  scope: "full", locale: "en", birthTimeKnown: false,
  facts: { lifePath: 7, sunSign: "Scorpio", chineseAnimal: "Horse", personalYear: 3 },
  lifeStageTerms: ["career", "work"],
};
const paragraph = "Your Life Path 7 and Scorpio Sun invite patient inquiry, while the Horse points toward movement. In your career, try a weekly review that gives both impulses room. A reflective practice can help you choose which opportunities deserve action without treating any tradition as a prediction. ";
const reading = `## Shared threads\n\n${paragraph.repeat(7)}\n\n## A useful tension\n\n${paragraph.repeat(7)}\n\n## Practical meaning\n\n${paragraph.repeat(7)}`;
const season = `Your Personal Year 3 can be a lens for testing fresh ways to communicate at work. ${"Choose one project and write a short note about what you learned before taking the next step. ".repeat(9)}`;
const valid = `<<<SNAPSHOT>>>\nYour Life Path 7 and Scorpio Sun suggest depth; the Horse adds movement. You can let curiosity and action take turns as your career grows.\n<<<READING>>>\n${reading}\n<<<SEASON>>>\n${season}\n<<<TOOLKIT>>>\n- Review one work decision each Friday.\n- Ask a colleague for feedback on one idea.\n- Keep a short log of experiments.`;

const good = evaluateReading(valid, fixture);
assert.equal(good.passed, true, JSON.stringify(good.checks.filter((c) => !c.passed)));
const bad = evaluateReading(valid.replace("<<<SEASON>>>", "<<<READING>>>").replace("Life Path 7", "Life Path 8").replace("Scorpio Sun", "Scorpio Sun, and your rising sign is Leo"), fixture);
assert.equal(bad.passed, false);
for (const id of ["marker_order", "life_path_grounding", "unknown_time"]) {
  assert.equal(bad.checks.find((c) => c.id === id)?.passed, false, id);
}
assert.equal(evaluateReading(valid.replace("Scorpio Sun", "Scorpio Sun, and your Moon sign is Leo"), { ...fixture, birthTimeKnown: true }).checks.find((c) => c.id === "unknown_time"), undefined);
assert.equal(evaluateReading(valid.replace("Scorpio Sun", "Scorpio Sun, and your Moon sign is Virgo"), { ...fixture, birthTimeKnown: true, facts: { ...fixture.facts, moonSign: "Leo" } }).checks.find((c) => c.id === "moon_grounding")?.passed, false);
assert.equal(evaluateReading(valid.replace("Your Life Path", "<<<SNAPSHOT>>> Your Life Path"), fixture).checks.find((c) => c.id === "marker_order")?.passed, false);

// House claims are graded against the chart instead of being banned outright.
const check = (output: string, f: EvalFixture, id: string) => evaluateReading(output, f).checks.find((c) => c.id === id)?.passed;
const withLine = (line: string) => valid.replace("<<<SEASON>>>", `${line}\n<<<SEASON>>>`);
const load = (name: string) => JSON.parse(readFileSync(join(__dirname, "fixtures", name), "utf8")) as EvalFixture;
assert.equal(check(withLine("Your Venus sits in the 6th house."), fixture, "house_grounding"), false, "house claim without a chart");

const ex1 = load("ex1-full-london.json");
assert.equal(check(withLine("With Venus in the 6th house and your chart ruler, Venus, steering, work can feel like care."), ex1, "house_grounding"), true);
assert.equal(check(withLine("With Venus in the 6th house and your chart ruler, Venus, steering, work can feel like care."), ex1, "chart_ruler_grounding"), true);
assert.equal(check(withLine("A 3rd-house Mars likes debate."), ex1, "house_grounding"), true);
assert.equal(check(withLine("Your Moon in the 4th house craves home."), ex1, "house_grounding"), false, "wrong Moon house");
assert.equal(check(withLine("Your chart ruler is Mars."), ex1, "chart_ruler_grounding"), false, "wrong chart ruler");
assert.equal(check(withLine("Your 7th house sits on 12° Aries."), ex1, "no_unsupported_precision"), false, "degrees stay banned");
assert.equal(check(withLine("Today's transit favours you."), ex1, "no_unsupported_precision"), false, "transits stay banned");

const ex2 = load("ex2-solar-no-time.json");
assert.equal(check(withLine("Your Venus in your solar 1st house adds warmth."), ex2, "solar_houses_qualified"), true);
assert.equal(check(withLine("Your Venus in your solar 1st house adds warmth."), ex2, "house_grounding"), true);
assert.equal(check(withLine("Your Venus in the 1st house adds warmth."), ex2, "solar_houses_qualified"), false, "solar chart needs the qualifier");
assert.equal(check(withLine("Your chart ruler is Mars."), ex2, "chart_ruler_grounding"), false, "no chart ruler without a birth time");
assert.equal(check(withLine("Your rising sign is Leo."), ex2, "unknown_time"), false, "rising still fails without a time");
assert.equal(check(withLine("Your Moon in your solar 8th house runs deep."), ex2, "house_grounding"), false, "unstable Moon has no house");

const ex3 = load("ex3-stellium-istanbul.json");
assert.equal(check(withLine("Five planets cluster with Saturn in the 12th house, and Saturn is your chart ruler."), ex3, "house_grounding"), true);
assert.equal(check(withLine("Five planets cluster with Saturn in the 12th house, and Saturn is your chart ruler."), ex3, "chart_ruler_grounding"), true);
assert.equal(check(withLine("Uranus is your chart ruler."), ex3, "chart_ruler_grounding"), false, "the modern co-ruler is not the chart ruler");

const polar = load("polar-tromso.json");
assert.equal(polar.chart?.approximate, true, "polar fixture is approximate");

// Fixture charts must stay in step with the engine.
for (const name of ["ex1-full-london.json", "ex2-solar-no-time.json", "ex3-stellium-istanbul.json", "polar-tromso.json"]) {
  const f = load(name);
  const chart = computeChart(f.birth!);
  assert.deepEqual(f.chart?.houses, Object.fromEntries(PLANETS.filter((p) => !chart.bodies[p].unstable).map((p) => [p, chart.bodies[p].house])), `${name} houses`);
  assert.equal(f.chart?.chartRuler, chart.chartRuler?.planet, `${name} chart ruler`);
  assert.equal(f.chart?.approximate, chart.approximate, `${name} approximate`);
}
console.log("Reading eval: positive and negative cases passed");
