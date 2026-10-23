import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { compareDescription, compareHeadline, compareLabel, type CompareValue } from "./compare";

export const compareOgSize = { width: 1200, height: 630 };

// The homepage hero: a dark band with the light "personal atlas" dossier card.
const DARK = "#121212";
const LIGHT = "#f7f7f7";
const INK = "#575657";
const MUTED = "#bdbdbd";
const RULE = "#c8c8c5";

const publicFile = (...parts: string[]) => readFileSync(path.join(process.cwd(), "public", ...parts));
let fonts: Array<{ name: string; data: Buffer; style: "normal"; weight: 400 }> | undefined;
const loadFonts = () => (fonts ??= [
  { name: "Romana", data: publicFile("fonts", "romana-regular.otf"), style: "normal" as const, weight: 400 as const },
  { name: "Mono", data: publicFile("fonts", "ibm-plex-mono-regular.ttf"), style: "normal" as const, weight: 400 as const },
]);
const artwork = (name: string) => `data:image/png;base64,${publicFile("artwork", `${name}.png`).toString("base64")}`;

/** Same artwork the reading uses: the abacus for numbers, the armillary for signs, each animal's own plate. */
function artworkFor(value: CompareValue | null): string {
  if (!value || value.t === "sun") return "zodiac-armillary";
  if (value.t === "lp") return "numbers-abacus";
  return value.v === "horse" ? "chinese-zodiac-horse" : `zodiac-${value.v}`;
}

const TYPE_LABEL = { lp: "Life Path", sun: "Sun sign", cz: "Chinese zodiac" } as const;

const Label = ({ children, color = INK }: { children: React.ReactNode; color?: string }) =>
  <div style={{ display: "flex", fontFamily: "Mono", fontSize: 17, letterSpacing: 1.5, textTransform: "uppercase", color }}>{children}</div>;
const Rule = () => <div style={{ display: "flex", height: 1, background: RULE, margin: "18px 0" }} />;

/**
 * /compare share card in the site's own look (Romana, mono labels, the
 * dossier card and reading artwork). WhatsApp, Reddit and LinkedIn show only
 * this image, so it carries the whole invitation. Null draws the generic card.
 */
export function compareOgImage(value: CompareValue | null): ImageResponse {
  const headline = value ? compareHeadline(value) : "Compare with a friend";
  const line = value ? compareDescription(value) : "Life Path, Sun sign or Chinese zodiac: see how you match. Free, no signup.";
  const mark = value ? (value.t === "lp" ? value.v : compareLabel(value)) : "?";
  const markSize = mark.length <= 2 ? 96 : mark.length <= 6 ? 64 : 52;
  const cells = value
    ? [{ mark, label: TYPE_LABEL[value.t], size: markSize }, { mark: "?", label: "Yours", size: markSize }]
    : [{ mark: "?", label: "Life Path", size: 64 }, { mark: "?", label: "Sun sign", size: 64 }, { mark: "?", label: "Animal", size: 64 }];

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 64px 0 72px", background: DARK, color: LIGHT }}>
      <div style={{ display: "flex", flexDirection: "column", width: 600 }}>
        <Label color={LIGHT}>Unified Reading / Compare with a friend</Label>
        <div style={{ display: "flex", fontFamily: "Romana", fontSize: headline.length > 34 ? 62 : 72, lineHeight: 1.08, marginTop: 30 }}>{headline}</div>
        <div style={{ display: "flex", fontSize: 25, lineHeight: 1.4, marginTop: 26, color: MUTED }}>{line}</div>
        <div style={{ display: "flex", marginTop: 40 }}><Label color={MUTED}>Free preview / no account required</Label></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: 430, padding: 28, background: LIGHT, border: `1px solid ${RULE}`, color: INK }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><Label>U/R — Compare</Label><Label>{value ? "You & ?" : "Two dates"}</Label></div>
        <Rule />
        <div style={{ display: "flex", justifyContent: "center", height: 200 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artwork(artworkFor(value))} width={200} height={200} alt="" style={{ objectFit: "contain" }} />
        </div>
        <Rule />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {cells.map((cell) => (
            <div key={cell.label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontFamily: "Romana", fontSize: cell.size, lineHeight: 1 }}>{cell.mark}</div>
              <div style={{ display: "flex", marginTop: 10 }}><Label>{cell.label}</Label></div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    { ...compareOgSize, fonts: loadFonts() },
  );
}
