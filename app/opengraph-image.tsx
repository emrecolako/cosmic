import { ImageResponse } from "next/og";

export const alt =
  "Cosmic Blueprint — your numerology, astrology and Chinese zodiac, read as one";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const tiles = [
    ["LIFE PATH", "6"],
    ["SUN SIGN", "Scorpio"],
    ["CHINESE SIGN", "Metal Horse"],
  ];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000",
          color: "#fff",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: "#a1a1aa" }}>
          COSMIC-BLUEPRINT
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 60, lineHeight: 1.12, fontWeight: 300, maxWidth: 960 }}>
            Your numbers, your stars and your Chinese sign — read as one.
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 44 }}>
            {tiles.map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "#18181b",
                  borderRadius: 14,
                  padding: "20px 28px",
                  minWidth: 220,
                }}
              >
                <div style={{ display: "flex", fontSize: 18, letterSpacing: 3, color: "#a1a1aa" }}>
                  {label}
                </div>
                <div style={{ display: "flex", fontSize: 40, marginTop: 6 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#d4d4d8" }}>
          Free · No sign-up · About 1 minute
        </div>
      </div>
    ),
    size
  );
}
