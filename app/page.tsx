"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StarField from "@/components/StarField";
import InputWizard from "@/components/InputWizard";
import { useI18n } from "@/components/I18nProvider";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { t, locale, setLocale } = useI18n();

  const handleSubmit = async (formData: {
    fullName: string;
    dateOfBirth: string;
    birthTime: string;
    knowBirthTime: boolean;
    birthPlace: string;
    lifeStage: string;
    whatsOnYourMind: string;
    gender: string;
  }) => {
    setIsLoading(true);

    const params = new URLSearchParams();
    params.set("name", formData.fullName);
    params.set("dob", formData.dateOfBirth);
    if (formData.birthTime) params.set("time", formData.birthTime);
    if (formData.birthPlace) params.set("place", formData.birthPlace);
    params.set("stage", formData.lifeStage);
    if (formData.whatsOnYourMind) params.set("mind", formData.whatsOnYourMind);
    if (formData.gender) params.set("gender", formData.gender);
    params.set("lang", locale);

    router.push(`/results?${params.toString()}`);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <StarField />

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Language toggle */}
        <div className="absolute top-0 right-0 flex gap-1">
          <button
            onClick={() => setLocale("en")}
            className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
              locale === "en"
                ? "bg-gold/20 text-gold border border-gold/30"
                : "text-cream/30 hover:text-cream/50"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLocale("tr")}
            className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
              locale === "tr"
                ? "bg-gold/20 text-gold border border-gold/30"
                : "text-cream/30 hover:text-cream/50"
            }`}
          >
            TR
          </button>
        </div>

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-navy-border bg-navy-light/50 text-xs text-cream/50 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            {t.landing.badge}
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 glow-gold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="text-gold">{t.landing.title1}</span>{" "}
            <span className="text-cream">{t.landing.title2}</span>
          </h1>

          <p className="text-lg text-cream/60 max-w-md mx-auto leading-relaxed">
            {t.landing.subtitle}
            <br />
            <span className="text-cream/40">{t.landing.subtitle2}</span>
          </p>
        </div>

        {/* Input Wizard */}
        <InputWizard onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Footer note */}
        <p className="text-center text-xs text-cream/25 mt-12">
          {t.landing.privacy}
        </p>
      </div>
    </main>
  );
}
