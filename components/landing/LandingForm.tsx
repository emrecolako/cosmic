"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputWizard, { type WizardData } from "@/components/InputWizard";
import { saveReadingInput } from "@/lib/profile";

export default function LandingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (formData: WizardData) => {
    if (formData.lifeStages.length === 0 || isLoading) return;
    setIsLoading(true);

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
