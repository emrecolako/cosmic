import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { loadContent } from "./content";
import { factsFor } from "./facts";
import type { LibraryEntry } from "./registry";

export const ogSize = { width: 1200, height: 630 };

let romana: Buffer | undefined;
const editorialFont = () => (romana ??= readFileSync(path.join(process.cwd(), "public", "fonts", "romana-regular.otf")));

const firstSentence = (text: string) => text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;

const NAVY = "#0a0e27";
const GOLD = "#d4a853";
const INK = "#f6f2e9";
const MUTED = "#c5c4d4";

/** Same palette as the /sample card: navy ground, gold accents. */
export function libraryOgImage(entry: LibraryEntry): ImageResponse {
  const content = loadContent(entry);
  const { mark, pair } = factsFor(entry);
  const eyebrow = <div style={{ fontSize: 24, letterSpacing: 6, color: GOLD, textTransform: "uppercase" }}>Unified Reading · Library</div>;
  const fonts = [{ name: "Romana", data: editorialFont(), style: "normal" as const, weight: 400 as const }];

  if (pair) {
    const longest = Math.max(pair[0].length, pair[1].length);
    const size = longest <= 2 ? 190 : longest <= 6 ? 120 : longest <= 9 ? 96 : 84;
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 90px", background: NAVY, color: INK }}>
        {eyebrow}
        <div style={{ display: "flex", alignItems: "center", marginTop: 26, fontFamily: "Romana", color: GOLD, lineHeight: 1 }}>
          <span style={{ fontSize: size }}>{pair[0]}</span>
          <span style={{ fontSize: Math.round(size * 0.5), color: MUTED, margin: "0 36px" }}>&amp;</span>
          <span style={{ fontSize: size }}>{pair[1]}</span>
        </div>
        <div style={{ display: "flex", fontSize: 34, lineHeight: 1.15, marginTop: 30, fontFamily: "Romana" }}>{entry.title}</div>
        <div style={{ display: "flex", fontSize: 30, lineHeight: 1.35, marginTop: 22, color: MUTED }}>{content.ogLine ?? firstSentence(content.answer)}</div>
      </div>,
      { ...ogSize, fonts },
    );
  }

  const markSize = mark.length <= 3 ? 150 : mark.length <= 9 ? 96 : mark.length <= 18 ? 68 : 52;
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "70px 90px", background: NAVY, color: INK }}>
      {eyebrow}
      <div style={{ display: "flex", fontSize: markSize, lineHeight: 1, marginTop: 34, color: GOLD, fontFamily: "Romana" }}>{mark}</div>
      <div style={{ display: "flex", fontSize: entry.title.length > 60 ? 46 : 58, lineHeight: 1.1, marginTop: 28, fontFamily: "Romana" }}>{entry.title}</div>
      <div style={{ display: "flex", fontSize: 27, lineHeight: 1.35, marginTop: 26, color: MUTED }}>{firstSentence(content.answer)}</div>
    </div>,
    { ...ogSize, fonts },
  );
}
