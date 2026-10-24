import { libraryOgImage } from "@/lib/library/og";
import { hubEntry } from "@/lib/library/registry";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = hubEntry("angel-numbers").title;

export default function OpenGraphImage() {
  return libraryOgImage(hubEntry("angel-numbers"));
}
