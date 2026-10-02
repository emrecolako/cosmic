import assert from "node:assert/strict";
import { evaluateReading, type EvalFixture } from "./reading";

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
console.log("Reading eval: positive and negative cases passed");
