import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { RESULT_CARD_COPY, type ResultCardNumber } from "./result-card-copy";

export type ResultCardSize = "story" | "square";
export const resultCardSizes = { story: { width: 1080, height: 1920 }, square: { width: 1080, height: 1080 } } as const;

/** Same tokens as the /compare card: dark band, light dossier card. */
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
let abacus: string | undefined;
const abacusArt = () => (abacus ??= `data:image/png;base64,${publicFile("artwork", "numbers-abacus.png").toString("base64")}`);

const Label = ({ children, color = INK, size = 28 }: { children: React.ReactNode; color?: string; size?: number }) =>
  <div style={{ display: "flex", fontFamily: "Mono", fontSize: size, letterSpacing: size * 0.09, textTransform: "uppercase", color }}>{children}</div>;
/** Satori sizes words without kerning but draws them kerned, leaving a gap after "Yo"; a ZWNJ breaks the pair. */
const unkern = (text: string) => text.replace(/Y(?=[a-z])/g, "Y\u200c");
const Rule = ({ gap }: { gap: number }) => <div style={{ display: "flex", height: 2, background: RULE, margin: `${gap}px 0` }} />;

/**
 * Life Path card made to be screenshotted: 9:16 for Stories, 1:1 for feeds.
 * It carries the number and its copy only, never a name or birth date.
 * Stories cover roughly the top and bottom 250px with UI, so the story
 * layout keeps everything that matters between them.
 */
export function resultCardImage(number: ResultCardNumber, size: ResultCardSize): ImageResponse {
  const { name } = RESULT_CARD_COPY[number];
  const line = unkern(RESULT_CARD_COPY[number].line);
  const master = number > 9;
  const no = `No. ${String(number).padStart(2, "0")}`;
  const kind = master ? "Master number" : "Life Path";
  const options = { ...resultCardSizes[size], fonts: loadFonts(), headers: { "Cache-Control": "public, max-age=86400, s-maxage=31536000" } };

  if (size === "story") {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "250px 84px 0", background: DARK, color: LIGHT }}>
        <Label color={LIGHT} size={30}>Unified Reading / My Life Path</Label>
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, marginTop: 44, padding: "44px 56px 60px", background: LIGHT, border: `2px solid ${RULE}`, color: INK }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><Label>U/R — {kind}</Label><Label>{no}</Label></div>
          <Rule gap={32} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexGrow: 1 }}>
            <div style={{ display: "flex", fontFamily: "Romana", fontSize: master ? 400 : 480, lineHeight: 1, letterSpacing: -8, color: DARK }}>{number}</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={abacusArt()} width={master ? 270 : 330} height={master ? 270 : 330} alt="" style={{ objectFit: "contain" }} />
          </div>
          <Rule gap={32} />
          <div style={{ display: "flex", fontFamily: "Romana", fontSize: name.length > 16 ? 76 : 88, lineHeight: 1.05, color: DARK }}>{name}</div>
          <div style={{ display: "flex", fontSize: 50, lineHeight: 1.3, marginTop: 30 }}>{line}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 64, marginBottom: 250 }}>
          <Label color={MUTED} size={28}>What&apos;s yours? Free, no signup</Label>
          <div style={{ display: "flex", fontFamily: "Romana", fontSize: 72, marginTop: 18 }}>unifiedreading.com</div>
        </div>
      </div>,
      options,
    );
  }

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "72px 72px 64px", background: DARK, color: LIGHT }}>
      <Label color={LIGHT} size={26}>Unified Reading / My Life Path</Label>
      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, marginTop: 36, padding: "36px 48px 44px", background: LIGHT, border: `2px solid ${RULE}`, color: INK }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><Label size={24}>U/R — {kind}</Label><Label size={24}>{no}</Label></div>
        <Rule gap={24} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexGrow: 1 }}>
          <div style={{ display: "flex", fontFamily: "Romana", fontSize: master ? 300 : 360, lineHeight: 1, letterSpacing: -6, color: DARK }}>{number}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={abacusArt()} width={master ? 240 : 290} height={master ? 240 : 290} alt="" style={{ objectFit: "contain" }} />
        </div>
        <Rule gap={24} />
        <div style={{ display: "flex", fontFamily: "Romana", fontSize: name.length > 16 ? 60 : 68, lineHeight: 1.05, color: DARK }}>{name}</div>
        <div style={{ display: "flex", fontSize: 38, lineHeight: 1.3, marginTop: 18 }}>{line}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 36 }}>
        <Label color={MUTED} size={24}>What&apos;s yours? Free, no signup</Label>
        <div style={{ display: "flex", fontFamily: "Romana", fontSize: 52, lineHeight: 1 }}>unifiedreading.com</div>
      </div>
    </div>,
    options,
  );
}
