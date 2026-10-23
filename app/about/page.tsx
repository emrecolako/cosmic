import ReadingArtwork from "@/components/ReadingArtwork";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Unified Reading",
  description: "How Unified Reading combines numerology, Western astrology and the Chinese zodiac into a personal reflection reading.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <main id="main" lang="en" className="atlas-shell"><article className="unified-prose">
    <Link className="atlas-link" href="/">← Unified Reading</Link>
    <ReadingArtwork name="numbers-abacus" className="page-art" /><p className="eyebrow">The method</p><h1 className="wizard-title editorial">About Unified Reading</h1>
    <p>Unified Reading is a web-based personal reflection experience. It combines calculated numerology, Western zodiac signs, the Chinese zodiac, and the life chapter you select into one narrative. You can inspect a <Link href="/sample">fictional sample reading</Link> before entering any personal details.</p>
    <h2>What the reading uses</h2>
    <p>Your birth name and date provide the numerology numbers. Your birth date provides the Sun sign and Chinese zodiac animal, element, and polarity; the Chinese zodiac follows Lunar New Year rather than January 1. If you know your birth time, the app can include a Moon sign and, with a birthplace, a rising sign. With a birth time and place, whole sign houses (each house is one sign, counted from the rising sign) and the chart ruler are calculated; without a birth time the app shows a solar chart counted from the Sun sign. Planetary aspects and current transits are not calculated.</p>
    <h2>How the synthesis works</h2>
    <p>The app calculates these values in your browser. If you ask for an interpretation, it sends your profile and optional life context to a language model through OpenRouter. The generated text looks for shared themes, useful tensions, and practical reflection prompts. These traditions are interpretive frameworks, not verified ways to predict the future or determine personality.</p>
    <h2>Privacy and price</h2>
    <p>The sample is public and free. You see a preview of your own reading first; the full reading is a one-time purchase. See <Link href="/pricing">current pricing</Link> before you start and our <Link href="/privacy">privacy explanation</Link> for the data flow and caching details.</p>
    <p>Questions or product feedback? <Link href="/contact">Contact the project</Link>.</p>
  </article></main>;
}
