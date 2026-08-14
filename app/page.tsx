"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputWizard from "@/components/InputWizard";
import { t } from "@/lib/i18n";
import { saveReadingInput } from "@/lib/profile";
import type { LifeStageOption } from "@/lib/life-stages";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (formData: {
    fullName: string;
    dateOfBirth: string;
    birthTime: string;
    dontKnowBirthTime: boolean;
    birthPlace: string;
    lifeStage: LifeStageOption | "";
    whatsOnYourMind: string;
    gender: string;
  }) => {
    if (!formData.lifeStage) return;
    setIsLoading(true);

    // Hand off via sessionStorage — birth details never enter the URL.
    saveReadingInput({
      fullName: formData.fullName.trim(),
      dateOfBirth: formData.dateOfBirth,
      birthTime: !formData.dontKnowBirthTime && formData.birthTime ? formData.birthTime : undefined,
      birthPlace: formData.birthPlace.trim() || undefined,
      lifeStage: formData.lifeStage,
      whatsOnYourMind: formData.whatsOnYourMind.trim() || undefined,
      gender: formData.gender || undefined,
    });

    router.push("/results");
  };

  return (
    <main className="min-h-screen pt-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 lg:py-16 animate-fade-in">
        {/* Hero */}
        <div className="font-mono text-xs mb-12">
          <h1 className="text-2xl sm:text-3xl tracking-wider text-ink mb-6 uppercase">
            {t.landing.title1} {t.landing.title2}
          </h1>
          <p className="tracking-wider max-w-md leading-relaxed text-ink-muted uppercase">
            {t.landing.subtitle} {t.landing.subtitle2}
          </p>
          <p className="tracking-wider mt-2 text-ink-muted/70 uppercase">{t.landing.badge}</p>
        </div>

        {/* Input Wizard */}
        <InputWizard onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Privacy note */}
        <p className="text-center font-mono text-xs tracking-wider uppercase text-ink-muted mt-12">
          {t.landing.privacy}
        </p>
      </div>
    </main>
  );
}
