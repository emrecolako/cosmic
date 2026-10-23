/**
 * Runs after `next build`: no house library body text may appear in the
 * browser chunks, so locked text can only arrive from the server after payment.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { LIBRARY, sentences } from "../lib/chart/compose";

const STATIC = join(__dirname, "..", ".next", "static");
const files: string[] = [];
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(js|json|txt|html)$/.test(name)) files.push(path);
  }
};
walk(STATIC);
const bundle = files.map((f) => readFileSync(f, "utf8")).join("\n");

const probes = [...new Set(LIBRARY.flatMap((e) => sentences(e.body)).filter((s) => s.length >= 40))];
const known = "learn over time that rest is part of doing good work";
const leaks = probes.filter((s) => bundle.includes(s) || bundle.includes(JSON.stringify(s).slice(1, -1)));
if (!probes.some((s) => s.includes(known))) throw new Error("Probe sentence missing from the library");
if (bundle.includes(known)) leaks.unshift(known);

for (const s of leaks.slice(0, 5)) console.error(`FAIL library text in client bundle: "${s}"`);
console.log(`Scanned ${files.length} client files for ${probes.length} library sentences: ${leaks.length} found`);
if (leaks.length || files.length === 0) process.exit(1);
