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

export default function HomePage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const copy = atlasCopy[locale];
  const [showWizard, setShowWizard] = useState(false);
  useEffect(() => { if (window.location.hash === "#details") setShowWizard(true); }, []);
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
              <Link className="atlas-link" href="/sample">{copy.sample}<span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <figure className="seal-figure"><FortuneCards labels={[t.sections.numbersTitle, t.sections.starMapTitle, t.sections.easternMirrorTitle]} /><figcaption>{copy.eyebrow}</figcaption></figure>
        </section>
        <aside className="sample-insight">
          <div className="eyebrow">{copy.glimpse}<br /><span className="text-ink-muted">{copy.sampleLabel} · Alex Morgan<br />{t.numerology.lifePath} 7</span></div>
          <blockquote>“{copy.insight}”</blockquote>
        </aside>
      </> : <div className="wizard-shell">
        <InputWizard onSubmit={handleSubmit} isLoading={isLoading} onExit={() => setShowWizard(false)} />
      </div>}
      <footer className="atlas-footer"><p>{copy.privacy} <Link className="underline" href="/privacy">OpenRouter · Privacy</Link></p><p className="mt-2">{copy.reflection}</p></footer>
    </main>
  );
}
