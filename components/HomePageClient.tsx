"use client";

import Link from "next/link";
import DirectionBLanding from "@/components/DirectionBLanding";
import { atlasCopy } from "@/lib/i18n/atlas";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputWizard from "@/components/InputWizard";
import { useI18n } from "@/components/LocaleProvider";
import { saveReadingInput } from "@/lib/profile";
import type { LifeStageOption } from "@/lib/life-stages";

/** `price` is null where Checkout isn't configured (local and preview builds). */
export default function HomePage({ price }: { price: string | null }) {
  const router = useRouter();
  const { locale } = useI18n();
  const copy = atlasCopy[locale];
  const [showWizard, setShowWizard] = useState(false);
  useEffect(() => {
    const syncHash = () => {
      if (window.location.hash === "#details") setShowWizard(true);
      else if (!window.location.hash) setShowWizard(false);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => { window.removeEventListener("hashchange", syncHash); window.removeEventListener("popstate", syncHash); };
  }, []);
  const openWizard = () => { window.location.hash = "details"; setShowWizard(true); window.scrollTo(0, 0); };
  const closeWizard = () => { window.history.pushState(null, "", window.location.pathname + window.location.search); setShowWizard(false); window.scrollTo(0, 0); };
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
    <main id="main" tabIndex={-1}>
      {!showWizard ? <DirectionBLanding price={price} onStart={openWizard} /> : <div className="atlas-shell"><div className="wizard-shell">
        <InputWizard onSubmit={handleSubmit} isLoading={isLoading} onExit={closeWizard} />
        <p className="wizard-privacy text-ink-muted mt-10">{copy.privacy} <Link className="underline" href="/privacy">OpenRouter · Privacy</Link></p>
      </div></div>}
    </main>
  );
}
