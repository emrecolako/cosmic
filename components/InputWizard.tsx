"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { LifeStageOption } from "@/lib/life-stages";
import { useI18n } from "@/components/LocaleProvider";
import { Input, Textarea, FieldLabel, FieldError } from "@/components/ui/Field";
import TimeInput, { isCompleteTime } from "@/components/ui/TimeInput";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import Button from "@/components/ui/Button";
import { atlasCopy } from "@/lib/i18n/atlas";
import { parseDateOfBirth } from "@/lib/profile";
import { cn } from "@/lib/utils";

interface FormData {
  fullName: string;
  dateOfBirth: string;
  birthTime: string;
  dontKnowBirthTime: boolean;
  birthPlace: string;
  lifeStages: LifeStageOption[];
  whatsOnYourMind: string;
  gender: string;
}

interface InputWizardProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  onExit?: () => void;
}

const EMPTY_FORM: FormData = {
  fullName: "",
  dateOfBirth: "",
  birthTime: "",
  dontKnowBirthTime: false,
  birthPlace: "",
  lifeStages: [],
  whatsOnYourMind: "",
  gender: "",
};

const NAME_HELP = {
  en: 'Your birth name supplies the letters used for your expression, soul urge, and personality numbers.',
  tr: 'Doğum adının harfleri ifade, ruh arzusu ve kişilik sayılarını hesaplamak için kullanılır.',
  es: 'Las letras de tu nombre de nacimiento se usan para calcular tus números de expresión, alma y personalidad.',
  fr: 'Les lettres de votre nom de naissance servent à calculer vos nombres d’expression, d’âme et de personnalité.',
  de: 'Die Buchstaben deines Geburtsnamens bestimmen Ausdrucks-, Seelen- und Persönlichkeitszahl.',
  pt: 'As letras do seu nome de nascimento são usadas nos números de expressão, alma e personalidade.',
  it: 'Le lettere del nome di nascita servono a calcolare i numeri di espressione, anima e personalità.',
};

const FORM_STORAGE_KEY = "cosmic-form";
const DOB_MIN = "1900-01-01";

function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function InputWizard({ onSubmit, isLoading, onExit }: InputWizardProps) {
  const { t, locale } = useI18n();
  const copy = atlasCopy[locale];
  const reduceMotion = useReducedMotion();
  const [editingReview, setEditingReview] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(FORM_STORAGE_KEY);
      if (saved) setFormData({ ...EMPTY_FORM, ...JSON.parse(saved) });
    } catch {
      // Ignore corrupt storage.
    }
  }, []);

  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => {
        const next = { ...prev, [field]: value };
        try {
          sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Persistence is best-effort when storage is unavailable.
        }
        return next;
      });
    },
    []
  );

  const dobInRange = (dob: string) => dob >= DOB_MIN && dob <= todayISO() && !!parseDateOfBirth(dob);

  const errors = {
    fullName: formData.fullName.trim() === "" ? t.wizard.errNameRequired : undefined,
    dateOfBirth:
      formData.dateOfBirth === ""
        ? t.wizard.errDobRequired
        : !dobInRange(formData.dateOfBirth)
          ? t.wizard.errDobRange
          : undefined,
    birthTime:
      !formData.dontKnowBirthTime &&
      formData.birthTime !== "" &&
      !isCompleteTime(formData.birthTime)
        ? t.wizard.errBirthTime
        : undefined,
    lifeStages:
      formData.lifeStages.length === 0 ? t.wizard.errLifeStageRequired : undefined,
  };

  const stepValid = (currentStep: number) =>
    currentStep === 0
      ? !errors.fullName && !errors.dateOfBirth
      : currentStep === 1 ? !errors.birthTime : currentStep === 2 ? !errors.lifeStages : true;

  const handleNext = () => {
    if (!stepValid(step)) {
      setAttempted(true);
      requestAnimationFrame(() => { const invalid = rootRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]'); (invalid ?? rootRef.current?.querySelector<HTMLElement>('[role="checkbox"]'))?.focus(); });
      return;
    }
    setAttempted(false);
    if (editingReview) { setEditingReview(false); setStep(4); }
    else if (step < 4) setStep(step + 1);
    else onSubmit(formData);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && event.target instanceof HTMLInputElement && event.target.type !== "checkbox" && event.target.getAttribute("role") !== "combobox") {
      event.preventDefault();
      handleNext();
    }
  };

  const lifeStageKeys: LifeStageOption[] = [
    "exploring",
    "building_career",
    "in_relationship",
    "married",
    "parent",
    "empty_nester",
    "retired",
    "prefer_not_to_say",
  ];

  const toggleLifeStage = (key: LifeStageOption) => {
    const current = formData.lifeStages;
    if (key === "prefer_not_to_say") {
      updateField(
        "lifeStages",
        current.includes(key) ? [] : ["prefer_not_to_say"]
      );
      return;
    }
    const withoutExclusive = current.filter((stage) => stage !== "prefer_not_to_say");
    updateField(
      "lifeStages",
      withoutExclusive.includes(key)
        ? withoutExclusive.filter((stage) => stage !== key)
        : [...withoutExclusive, key]
    );
  };

  const genderOptions = [
    { key: "Female", label: t.wizard.genderOptions.female },
    { key: "Male", label: t.wizard.genderOptions.male },
    { key: "Non-binary", label: t.wizard.genderOptions.nonBinary },
    { key: "Prefer not to say", label: t.wizard.genderOptions.preferNotToSay },
  ];

  const reviewTitle = { en: 'A moment to make sure.', tr: 'Son bir kez göz atalım.', es: 'Un momento para revisar.', fr: 'Un instant pour vérifier.', de: 'Ein Moment zum Überprüfen.', pt: 'Um momento para conferir.', it: 'Un momento per controllare.' }[locale];
  const stepTitles = [copy.beginnings, t.wizard.birthPlaceLabel, copy.chapter, t.wizard.whatsOnYourMindLabel, reviewTitle];

  return (
    <div ref={rootRef} className="wizard-form w-full max-w-xl mx-auto" onKeyDown={handleKeyDown}>
      <nav className="wizard-progress" aria-label={t.wizard.step1Title}>
        {[0, 1, 2, 3, 4].map(index => <button key={index} aria-label={stepTitles[index]} aria-current={index === step ? 'step' : undefined} disabled={index > step} onClick={() => { setAttempted(false); setStep(index); }}><span>{String(index + 1).padStart(2, '0')}</span></button>)}
      </nav>
      <h1 className="wizard-title editorial">{stepTitles[step]}</h1>
      <p className="text-ink-muted leading-relaxed mb-8">{step < 2 ? copy.birthHelper : step === 2 ? copy.chapterHelper : step === 3 ? t.wizard.whatsOnYourMindOptional : copy.birthHelper}</p>
      <div className="card p-6 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-6"
            >
              <Input
                label={t.wizard.fullNameLabel}
                type="text"
                value={formData.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                placeholder={t.wizard.fullNamePlaceholder}
                error={attempted ? errors.fullName : undefined}
                autoFocus
              />
              <p className="text-sm text-ink-muted">{NAME_HELP[locale]} <a className="underline" href="/privacy">Pythagorean numerology · OpenRouter · Privacy ↗</a></p>
              <Input
                label={t.wizard.dobLabel}
                type="date"
                min={DOB_MIN}
                max={todayISO()}
                value={formData.dateOfBirth}
                onChange={(event) => updateField("dateOfBirth", event.target.value)}
                error={attempted ? errors.dateOfBirth : undefined}
              />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="birth-place" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel hint={t.wizard.birthTimeOptional}>
                    {t.wizard.birthTimeLabel}
                  </FieldLabel>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={formData.dontKnowBirthTime}
                    onClick={() => {
                      const next = !formData.dontKnowBirthTime;
                      updateField("dontKnowBirthTime", next);
                      if (next) updateField("birthTime", "");
                    }}
                    className={cn(
                      "font-mono text-xs tracking-wider uppercase transition-opacity hover:opacity-70 mb-2",
                      formData.dontKnowBirthTime ? "text-ink" : "text-ink-muted"
                    )}
                  >
                    [{formData.dontKnowBirthTime ? "✓" : " "}] {t.wizard.iDontKnow}
                  </button>
                </div>
                {!formData.dontKnowBirthTime && (
                  <motion.div
                    initial={false}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TimeInput
                      ariaLabel={t.wizard.birthTimeLabel}
                      value={formData.birthTime}
                      onChange={(value) => updateField("birthTime", value)}
                      error={attempted ? errors.birthTime : undefined}
                    />
                  </motion.div>
                )}
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">{copy.unknown}</p>
              <PlaceAutocomplete
                label={t.wizard.birthPlaceLabel}
                value={formData.birthPlace}
                onChange={(value) => updateField("birthPlace", value)}
                placeholder={t.wizard.birthPlacePlaceholder}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-6"
            >
              <div>
                <FieldLabel hint={t.wizard.lifeStageHint}>
                  {t.wizard.lifeStageLabel}
                </FieldLabel>
                <div
                  role="group"
                  aria-label={t.wizard.lifeStageLabel}
                  className="grid grid-cols-2 gap-2"
                >
                  {lifeStageKeys.map((key) => (
                    <button
                      key={key}
                      type="button"
                      role="checkbox"
                      aria-checked={formData.lifeStages.includes(key)}
                      onClick={() => toggleLifeStage(key)}
                      className={cn(
                        "px-3 py-2.5 rounded-md border font-mono text-xs tracking-wider uppercase text-left transition-all duration-200",
                        formData.lifeStages.includes(key)
                          ? "bg-ink text-base border-ink"
                          : "border-line text-ink-secondary hover:bg-panel hover:text-ink hover:border-ink-muted"
                      )}
                    >
                      <span aria-hidden="true">{formData.lifeStages.includes(key) ? "✓ " : ""}</span>{t.lifeStages[key]}
                    </button>
                  ))}
                </div>
                <FieldError>{attempted ? errors.lifeStages : undefined}</FieldError>
              </div>

            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="focus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div>
                <Textarea
                  label={t.wizard.whatsOnYourMindLabel}
                  hint={t.wizard.whatsOnYourMindOptional}
                  value={formData.whatsOnYourMind}
                  onChange={(event) =>
                    updateField("whatsOnYourMind", event.target.value)
                  }
                  placeholder={t.wizard.whatsOnYourMindPlaceholder}
                  rows={3}
                  maxLength={200}
                />
                <span className="font-mono text-xs text-ink-muted mt-1.5 block text-right number-mono">
                  {formData.whatsOnYourMind.length}/200
                </span>
              </div>

              <div>
                <FieldLabel hint={t.wizard.genderOptional}>
                  {t.wizard.genderLabel}
                </FieldLabel>
                <div
                  role="radiogroup"
                  aria-label={t.wizard.genderLabel}
                  className="flex gap-2 flex-wrap"
                >
                  {genderOptions.map((option) => (
                    <button
                      key={option.key}
                      role="radio"
                      aria-checked={formData.gender === option.key}
                      onClick={() =>
                        updateField(
                          "gender",
                          formData.gender === option.key ? "" : option.key
                        )
                      }
                      className={cn(
                        "px-3 py-2 rounded-md border font-mono text-xs tracking-wider uppercase transition-all",
                        formData.gender === option.key
                          ? "bg-ink text-base border-ink"
                          : "border-line text-ink-secondary hover:bg-panel hover:text-ink"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          {step === 4 && <div className="review-details">
            {[
              [t.wizard.fullNameLabel, formData.fullName, 0],
              [t.wizard.dobLabel, formData.dateOfBirth, 0],
              [t.wizard.birthTimeLabel, formData.birthTime || t.wizard.iDontKnow, 1],
              [t.wizard.birthPlaceLabel, formData.birthPlace || '—', 1],
              [t.wizard.lifeStageLabel, formData.lifeStages.map(key => t.lifeStages[key]).join(', '), 2],
              [t.wizard.whatsOnYourMindLabel, formData.whatsOnYourMind || '—', 3],
              [t.wizard.genderLabel, formData.gender ? genderOptions.find(option => option.key === formData.gender)?.label : '—', 3],
            ].map(([label, value, target]) => <div className="review-row" key={String(label)}><div><p className="number-label">{label}</p><p>{value}</p></div><button aria-label={`${copy.edit}: ${label}`} onClick={() => { setEditingReview(true); setStep(Number(target)); }}>{copy.edit} ↗</button></div>)}
          </div>}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => {
            setAttempted(false);
            if (step === 0) onExit?.(); else setStep(step - 1);
          }}
          className={cn(
            "font-mono text-xs tracking-wider uppercase text-ink-muted hover:opacity-70 transition-opacity",
            step === 0 && !onExit && "hidden"
          )}
        >
          ← {t.wizard.back}
        </button>
        <Button onClick={handleNext} disabled={isLoading} size="lg">
          {isLoading
            ? t.wizard.loading
            : step === 4
              ? t.wizard.reveal
              : t.wizard.continue}
        </Button>
      </div>
    </div>
  );
}
