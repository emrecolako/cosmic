"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputWizard from "@/components/InputWizard";
import { useI18n } from "@/components/LocaleProvider";
import { saveReadingInput } from "@/lib/profile";
import type { LifeStageOption } from "@/lib/life-stages";

export default function HomePage() {
  const router = useRouter();
  const { t } = useI18n();
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
      birthTime: !formData.dontKnowBirthTime && formData.birthTime ? formData.birthTime : undefined,
      birthPlace: formData.birthPlace.trim() || undefined,
      lifeStages: formData.lifeStages,
      whatsOnYourMind: formData.whatsOnYourMind.trim() || undefined,
      gender: formData.gender || undefined,
    });
    router.push("/results");
  };

  return (
    <main className="min-h-screen pt-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 lg:py-16 animate-fade-in">
        <div className="font-mono text-xs mb-12">
          <h1 className="text-2xl sm:text-3xl tracking-wider text-ink mb-6 uppercase">
            {t.landing.title1} {t.landing.title2}
          </h1>
          <p className="tracking-wider max-w-md leading-relaxed text-ink-muted uppercase">
            {t.landing.subtitle} {t.landing.subtitle2}
          </p>
          <p className="tracking-wider mt-2 text-ink-muted/70 uppercase">{t.landing.badge}</p>
        </div>
        <InputWizard onSubmit={handleSubmit} isLoading={isLoading} />
        <p className="text-center font-mono text-xs tracking-wider uppercase text-ink-muted mt-12">
          {t.landing.privacy}
        </p>
      </div>
    </main>
  );
}
