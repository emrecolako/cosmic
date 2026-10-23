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

/** Same palette as the /sample card: navy ground, gold accents. */
export function libraryOgImage(entry: LibraryEntry): ImageResponse {
  const content = loadContent(entry);
  const { mark } = factsFor(entry);
  const markSize = mark.length <= 3 ? 150 : mark.length <= 9 ? 96 : mark.length <= 18 ? 68 : 52;
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "70px 90px", background: "#0a0e27", color: "#f6f2e9" }}>
      <div style={{ fontSize: 24, letterSpacing: 6, color: "#d4a853", textTransform: "uppercase" }}>Unified Reading · Library</div>
      <div style={{ display: "flex", fontSize: markSize, lineHeight: 1, marginTop: 34, color: "#d4a853", fontFamily: "Romana" }}>{mark}</div>
      <div style={{ display: "flex", fontSize: entry.title.length > 60 ? 46 : 58, lineHeight: 1.1, marginTop: 28, fontFamily: "Romana" }}>{entry.title}</div>
      <div style={{ display: "flex", fontSize: 27, lineHeight: 1.35, marginTop: 26, color: "#c5c4d4" }}>{firstSentence(content.answer)}</div>
    </div>,
    { ...ogSize, fonts: [{ name: "Romana", data: editorialFont(), style: "normal", weight: 400 }] },
  );
}
