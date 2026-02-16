"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LIFE_STAGE_LABELS, LIFE_STAGE_ICONS, LifeStageOption } from "@/lib/life-stages";

interface FormData {
  fullName: string;
  dateOfBirth: string;
  birthTime: string;
  knowBirthTime: boolean;
  birthPlace: string;
  lifeStage: LifeStageOption | "";
  whatsOnYourMind: string;
  gender: string;
}

interface InputWizardProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const STEP_TITLES = [
  "Your Birth Details",
  "Your Life Context",
];

export default function InputWizard({ onSubmit, isLoading }: InputWizardProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    dateOfBirth: "",
    birthTime: "",
    knowBirthTime: false,
    birthPlace: "",
    lifeStage: "",
    whatsOnYourMind: "",
    gender: "",
  });

  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const canProceed = () => {
    if (step === 0) {
      return formData.fullName.trim() !== "" && formData.dateOfBirth !== "";
    }
    if (step === 1) {
      return formData.lifeStage !== "";
    }
    return true;
  };

  const handleNext = () => {
    if (step < 1) {
      setStep(step + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canProceed()) {
      e.preventDefault();
      handleNext();
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  const lifeStages = Object.entries(LIFE_STAGE_LABELS) as [LifeStageOption, string][];

  return (
    <div className="w-full max-w-xl mx-auto" onKeyDown={handleKeyDown}>
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-3 mb-10">
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => i < step && setStep(i)}
            className={`flex items-center gap-2 transition-all duration-300 ${
              i <= step ? "opacity-100" : "opacity-40"
            }`}
            disabled={i > step}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                i === step
                  ? "bg-gold text-navy"
                  : i < step
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "bg-navy-light text-cream/50 border border-navy-border"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span
              className={`text-sm hidden sm:inline ${
                i === step ? "text-gold font-medium" : "text-cream/50"
              }`}
            >
              {STEP_TITLES[i]}
            </span>
          </button>
        ))}
      </div>

      {/* Step content */}
      <div className="glass-card p-8 relative overflow-hidden min-h-[380px]">
        <AnimatePresence mode="wait" custom={step}>
          {step === 0 && (
            <motion.div
              key="step-0"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-cream/70 mb-2">
                  Full name (as given at birth)
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Enter your full birth name"
                  className="w-full bg-navy/60 border border-navy-border rounded-xl px-4 py-3 text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cream/70 mb-2">
                  Date of birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField("dateOfBirth", e.target.value)}
                  className="w-full bg-navy/60 border border-navy-border rounded-xl px-4 py-3 text-cream focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all [color-scheme:dark]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-cream/70">
                    Time of birth
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      updateField("knowBirthTime", !formData.knowBirthTime);
                      if (formData.knowBirthTime) updateField("birthTime", "");
                    }}
                    className={`text-xs px-3 py-1 rounded-full transition-all ${
                      !formData.knowBirthTime
                        ? "bg-navy-border text-cream/50"
                        : "bg-gold/20 text-gold border border-gold/30"
                    }`}
                  >
                    {formData.knowBirthTime ? "I know my birth time" : "I don't know"}
                  </button>
                </div>
                {formData.knowBirthTime && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      type="time"
                      value={formData.birthTime}
                      onChange={(e) => updateField("birthTime", e.target.value)}
                      className="w-full bg-navy/60 border border-navy-border rounded-xl px-4 py-3 text-cream focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all [color-scheme:dark]"
                    />
                  </motion.div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-cream/70 mb-2">
                  Place of birth (city)
                </label>
                <input
                  type="text"
                  value={formData.birthPlace}
                  onChange={(e) => updateField("birthPlace", e.target.value)}
                  placeholder="Optional — enables rising sign calculation"
                  className="w-full bg-navy/60 border border-navy-border rounded-xl px-4 py-3 text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                />
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-cream/70 mb-3">
                  Current life stage
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {lifeStages.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => updateField("lifeStage", key)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                        formData.lifeStage === key
                          ? "border-gold/50 bg-gold/10 text-gold"
                          : "border-navy-border bg-navy/40 text-cream/70 hover:border-cream/20 hover:bg-navy/60"
                      }`}
                    >
                      <span className="text-xl">{LIFE_STAGE_ICONS[key]}</span>
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream/70 mb-2">
                  What&apos;s on your mind? <span className="text-cream/30">(optional)</span>
                </label>
                <textarea
                  value={formData.whatsOnYourMind}
                  onChange={(e) =>
                    updateField("whatsOnYourMind", e.target.value)
                  }
                  placeholder="A sentence or two about what's happening in your life right now..."
                  rows={3}
                  maxLength={200}
                  className="w-full bg-navy/60 border border-navy-border rounded-xl px-4 py-3 text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all resize-none"
                />
                <span className="text-xs text-cream/30 mt-1 block text-right">
                  {formData.whatsOnYourMind.length}/200
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream/70 mb-2">
                  Gender <span className="text-cream/30">(optional)</span>
                </label>
                <div className="flex gap-3">
                  {["Female", "Male", "Non-binary", "Prefer not to say"].map(
                    (g) => (
                      <button
                        key={g}
                        onClick={() => updateField("gender", g)}
                        className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                          formData.gender === g
                            ? "border-gold/50 bg-gold/10 text-gold"
                            : "border-navy-border bg-navy/40 text-cream/60 hover:border-cream/20"
                        }`}
                      >
                        {g}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep(step - 1)}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            step === 0
              ? "opacity-0 pointer-events-none"
              : "text-cream/60 hover:text-cream border border-navy-border hover:border-cream/30"
          }`}
        >
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed() || isLoading}
          className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
            canProceed() && !isLoading
              ? "bg-gold text-navy hover:bg-gold-dim shadow-lg shadow-gold/20"
              : "bg-navy-border text-cream/30 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Mapping your blueprint...
            </span>
          ) : step === 1 ? (
            "Reveal My Cosmic Blueprint"
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </div>
  );
}
