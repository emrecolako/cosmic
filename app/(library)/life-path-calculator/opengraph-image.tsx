import { libraryOgImage } from "@/lib/library/og";
import { calculatorEntry } from "@/lib/library/registry";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = calculatorEntry("life-path-calculator").title;

export default function OpenGraphImage() {
  return libraryOgImage(calculatorEntry("life-path-calculator"));
}
