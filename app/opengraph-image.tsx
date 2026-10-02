import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, background: "#0a0e27", color: "#f6f2e9" }}>
      <div style={{ fontSize: 25, letterSpacing: 6, color: "#d4a853", textTransform: "uppercase" }}>Unified Reading</div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 82, lineHeight: 1.08, marginTop: 38, fontFamily: "serif" }}><span>Many systems.</span><span>One you.</span></div>
      <div style={{ fontSize: 27, marginTop: 38, color: "#c5c4d4" }}>Numerology · Western astrology · Chinese zodiac</div>
    </div>,
    size,
  );
}
