"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InputWizard, { type WizardData } from "@/components/InputWizard";
import { saveReadingInput } from "@/lib/reading-input";
import { track } from "@/lib/analytics";

export default function LandingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    track("landing_view", { ref: ref ? ref.slice(0, 32) : null });
  }, []);

  const handleSubmit = (formData: WizardData) => {
    if (formData.lifeStages.length === 0 || isLoading) return;
    setIsLoading(true);
    track("form_submit", {
      hasTime: !formData.dontKnowBirthTime && !!formData.birthTime,
      hasPlace: !!formData.birthPlace.trim(),
      pickedPlace: !!formData.birthCoords,
      stages: formData.lifeStages.length,
      hasNote: !!formData.whatsOnYourMind.trim(),
      hasGender: !!formData.gender,
    });

    saveReadingInput({
      fullName: formData.fullName.trim(),
      dateOfBirth: formData.dateOfBirth,
      birthTime:
        !formData.dontKnowBirthTime && formData.birthTime
          ? formData.birthTime
          : undefined,
      birthPlace: formData.birthPlace.trim() || undefined,
      birthCoords:
        formData.birthPlace.trim() && formData.birthCoords
          ? formData.birthCoords
          : undefined,
      lifeStages: formData.lifeStages,
      whatsOnYourMind: formData.whatsOnYourMind.trim() || undefined,
      gender: formData.gender || undefined,
    });

    router.push("/results");
  };

  return <InputWizard onSubmit={handleSubmit} isLoading={isLoading} />;
}
