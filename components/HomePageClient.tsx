"use client";

import Link from "next/link";
import FortuneCards from "@/components/FortuneCards";
import { atlasCopy } from "@/lib/i18n/atlas";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputWizard from "@/components/InputWizard";
import { useI18n } from "@/components/LocaleProvider";
import { saveReadingInput } from "@/lib/profile";
import type { LifeStageOption } from "@/lib/life-stages";

const sampleToolAttributes = {
  toolname: "view_sample_reading",
  tooldescription: "Open a public sample Cosmic Blueprint reading, with no birth details or payment required.",
};

type BrowserTool = {
  name: string;
  description: string;
  inputSchema: { type: "object"; properties: Record<string, never> };
  annotations: { readOnlyHint: boolean };
  execute: () => string;
};

type WebMcpDocument = Document & {
  modelContext?: {
    registerTool: (tool: BrowserTool, options: { signal: AbortSignal }) => Promise<void>;
  };
};

export default function HomePage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const copy = atlasCopy[locale];
  const [showWizard, setShowWizard] = useState(false);
  useEffect(() => { if (window.location.hash === "#details") setShowWizard(true); }, []);
  useEffect(() => {
    const modelContext = (document as WebMcpDocument).modelContext;
    if (!modelContext) return;

    const controller = new AbortController();
    const schema = { type: "object" as const, properties: {} };
    const tools: BrowserTool[] = [
      {
        name: "get_cosmic_blueprint_options",
        description: "Explain the public sample, personal reading, price page, and privacy page without collecting anyone's birth details.",
        inputSchema: schema,
        annotations: { readOnlyHint: true },
        execute: () => JSON.stringify({
          sample: "https://unifiedreading.com/sample",
          startReading: "https://unifiedreading.com/#details",
          pricing: "https://unifiedreading.com/pricing",
          privacy: "https://unifiedreading.com/privacy",
          note: "The reading is an interpretive reflection, not a scientific assessment or prediction. Let the person enter birth details on the site.",
        }),
      },
      {
        name: "open_cosmic_blueprint_sample",
        description: "Open the free fictional sample reading in this browser tab. No personal details or payment are required.",
        inputSchema: schema,
        annotations: { readOnlyHint: false },
        execute: () => {
          window.location.assign("/sample");
          return "Opening the public sample reading.";
        },
      },
    ];

    for (const tool of tools) {
      void modelContext.registerTool(tool, { signal: controller.signal }).catch(() => {
        // Browsers without a working WebMCP implementation retain the normal UI.
      });
    }
    return () => controller.abort();
  }, []);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (formData: {
    fullName: string;
    dateOfBirth: string;
    birthTime: string;
    dontKnowBirthTime: boolean;
    birthPlace: string;
    lifeStages: LifeStageOption[];
    whatsOnYourMind: string;
    gender: string;
  }) => {
    if (formData.lifeStages.length === 0) return;
    setIsLoading(true);

    saveReadingInput({
      fullName: formData.fullName.trim(),
      dateOfBirth: formData.dateOfBirth,
      birthTime:
        !formData.dontKnowBirthTime && formData.birthTime
          ? formData.birthTime
          : undefined,
      birthPlace: formData.birthPlace.trim() || undefined,
      lifeStages: formData.lifeStages,
      whatsOnYourMind: formData.whatsOnYourMind.trim() || undefined,
      gender: formData.gender || undefined,
    });

    router.push("/results");
  };

  return (
    <main id="main" className="atlas-shell">
      {!showWizard ? <>
        <section className="atlas-hero">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 className="atlas-headline">{copy.headline}{" "}<em>{copy.headlineEnd}</em></h1>
            <p className="hero-description">{copy.description}</p>
            <div className="hero-actions">
              <button className="atlas-primary" onClick={() => { setShowWizard(true); window.scrollTo(0, 0); }}>{copy.discover}<span aria-hidden="true">↗</span></button>
              <form action="/sample" method="get" {...sampleToolAttributes}>
                <button className="atlas-link" type="submit">{copy.sample}<span aria-hidden="true">→</span></button>
              </form>
            </div>
          </div>
          <figure className="seal-figure"><FortuneCards labels={[t.sections.numbersTitle, t.sections.starMapTitle, t.sections.easternMirrorTitle]} /><figcaption>{copy.eyebrow}</figcaption></figure>
        </section>
        <aside className="sample-insight">
          <div className="eyebrow">{copy.glimpse}<br /><span className="text-ink-muted">{copy.sampleLabel} · Alex Morgan<br />{t.numerology.lifePath} 7</span></div>
          <blockquote>“{copy.insight}”</blockquote>
        </aside>
        <section lang="en" className="mx-auto max-w-4xl py-16 sm:py-24 space-y-10" aria-labelledby="about-reading">
          <div className="space-y-4">
            <p className="eyebrow">The method</p>
            <h2 id="about-reading" className="wizard-title editorial">One reading, three lenses.</h2>
            <p className="hero-description">Cosmic Blueprint is a personal reflection tool. It brings together Pythagorean numerology, Western zodiac signs, and the Chinese zodiac in one reading shaped by your current life stage. The point is to notice where the traditions echo each other, where they differ, and which ideas might be useful in your life now.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <article className="card p-6"><h3 className="text-xl editorial mb-3">Your numbers</h3><p className="text-ink-secondary leading-relaxed">Your birth date and birth name are used to calculate a Life Path, Expression, Soul Urge, Personality, and Personal Year number. Master numbers 11, 22, and 33 stay intact.</p></article>
            <article className="card p-6"><h3 className="text-xl editorial mb-3">Your sky</h3><p className="text-ink-secondary leading-relaxed">Your birth date provides a Sun sign. A known birth time can add a Moon sign and, with a birthplace, a rising sign. The chart is approximate and shown by sign; it does not calculate houses, aspects, or current planetary transits.</p></article>
            <article className="card p-6"><h3 className="text-xl editorial mb-3">Your eastern mirror</h3><p className="text-ink-secondary leading-relaxed">The Chinese zodiac uses the Lunar New Year boundary, so a January or February birthday is checked against the actual new year date. Your animal, element, and yin or yang polarity add another perspective.</p></article>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl editorial">What happens next?</h2>
            <p className="text-ink-secondary leading-relaxed">Enter your birth details and choose the life chapters that fit you. Calculations happen in your browser. When you request the interpretation, your profile is sent to our API and processed by OpenRouter and its model providers. A short preview is available before a one-time checkout for the full reading when payments are enabled. You can <Link className="underline" href="/sample">explore a fictional sample</Link> without sharing your details, and <Link className="underline" href="/pricing">check the current price</Link> before starting.</p>
            <p className="text-ink-secondary leading-relaxed">This is an interpretive experience for reflection and practical ideas, not a scientific personality test or a deterministic prediction. Birth time is optional; if you do not know it, Moon, rising, and house claims are omitted. Read more <Link className="underline" href="/about">about the method</Link>, review <Link className="underline" href="/privacy">how your data is handled</Link>, or <Link className="underline" href="/contact">contact the project</Link>.</p>
          </div>
          <div className="space-y-5">
            <h2 className="text-3xl editorial">Common questions</h2>
            <div><h3 className="text-xl editorial">Can I see a reading before entering my details?</h3><p className="text-ink-secondary leading-relaxed">Yes. The fictional sample is public and free, and does not ask for birth information.</p></div>
            <div><h3 className="text-xl editorial">What if I do not know my birth time?</h3><p className="text-ink-secondary leading-relaxed">You can still get a reading. The app omits Moon, rising, and house claims when the birth time is unknown.</p></div>
            <div><h3 className="text-xl editorial">Is this a prediction?</h3><p className="text-ink-secondary leading-relaxed">No. The reading uses interpretive traditions as prompts for reflection; it is not a scientific assessment or a deterministic forecast.</p></div>
          </div>
        </section>
      </> : <div className="wizard-shell">
        <InputWizard onSubmit={handleSubmit} isLoading={isLoading} onExit={() => setShowWizard(false)} />
      </div>}
      <footer className="atlas-footer"><p>{copy.privacy} <Link className="underline" href="/privacy">OpenRouter · Privacy</Link></p><p className="mt-2">{copy.reflection}</p></footer>
    </main>
  );
}
