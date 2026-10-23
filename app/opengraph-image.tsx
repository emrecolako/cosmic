import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, background: "#121212", color: "#f7f7f7" }}>
      <div style={{ fontSize: 25, letterSpacing: 0, color: "#f7f7f7", textTransform: "uppercase" }}>Unified Reading</div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 82, lineHeight: 1.08, marginTop: 38, fontFamily: "serif" }}><span>You are</span><span>not one thing.</span></div>
      <div style={{ fontSize: 27, marginTop: 38, color: "#bdbdbd" }}>Numerology · Western astrology · Chinese zodiac</div>
    </div>,
    size,
  );
}
