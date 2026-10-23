/**
 * Pre-renders the muted og:video loop for every /compare value into
 * public/compare/video/<t>-<v>.mp4. Each loop is the share card itself with a
 * slow push-in and back, so it starts and ends on the same frame. Run against
 * a running server (`npm run dev`) after changing the card:
 *
 *   npx tsx scripts/compare-videos.ts [http://localhost:3000]
 *
 * Needs ffmpeg on PATH.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ALL_COMPARE_VALUES, compareCardKey, compareOgImagePath } from "../lib/compare";

const base = process.argv[2] ?? "http://localhost:3000";
const out = join(__dirname, "..", "public", "compare", "video");
const work = mkdtempSync(join(tmpdir(), "compare-video-"));
mkdirSync(out, { recursive: true });

const SECONDS = 6;
const FPS = 30;
const ZOOM = 0.04;
const frames = SECONDS * FPS;
// Cosine ease from 1 to 1+ZOOM and back over the loop; rendered at 2x then scaled down to avoid zoompan jitter.
const zoom = `1+${ZOOM / 2}*(1-cos(2*PI*on/${frames}))`;
const filter = `scale=2400:1260,zoompan=z='${zoom}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=${frames}:s=1200x630:fps=${FPS},format=yuv420p`;

(async () => {
  for (const value of ALL_COMPARE_VALUES) {
    const key = compareCardKey(value);
    const response = await fetch(`${base}${compareOgImagePath(value)}`);
    if (!response.ok || response.headers.get("content-type") !== "image/png") throw new Error(`${key}: card returned ${response.status}`);
    const png = join(work, `${key}.png`);
    writeFileSync(png, Buffer.from(await response.arrayBuffer()));
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-loop", "1", "-i", png, "-vf", filter, "-frames:v", String(frames),
      "-c:v", "libx264", "-profile:v", "high", "-crf", "26", "-preset", "slow", "-an", "-movflags", "+faststart", join(out, `${key}.mp4`)]);
    console.log(`OK ${key}.mp4`);
  }
  rmSync(work, { recursive: true, force: true });
})();
