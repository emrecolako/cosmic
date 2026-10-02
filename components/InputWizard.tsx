"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { LifeStageOption } from "@/lib/life-stages";
import { useI18n } from "@/components/LocaleProvider";
import { formatMessage } from "@/lib/i18n";
import { Input, Textarea, FieldLabel, FieldError } from "@/components/ui/Field";
import TimeInput, { isCompleteTime } from "@/components/ui/TimeInput";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import DateOfBirthInput, { isCompleteDob, isRealDate } from "@/components/ui/DateOfBirthInput";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

export interface WizardData {
  fullName: string;
  dateOfBirth: string;
  birthTime: string;
  dontKnowBirthTime: boolean;
  birthPlace: string;
  /** Coordinates of the picked autocomplete suggestion; null when typed freely. */
  birthCoords: { latitude: number; longitude: number } | null;
  lifeStages: LifeStageOption[];
  whatsOnYourMind: string;
  gender: string;
}

interface InputWizardProps {
  onSubmit: (data: WizardData) => void;
  isLoading: boolean;
}

const EMPTY_FORM: WizardData = {
  fullName: "",
  dateOfBirth: "",
  birthTime: "",
  dontKnowBirthTime: false,
  birthPlace: "",
  birthCoords: null,
  lifeStages: [],
  whatsOnYourMind: "",
  gender: "",
};

const FORM_STORAGE_KEY = "cosmic-form";
const DOB_MIN = "1900-01-01";
const TOTAL_STEPS = 2;

type FieldKey = "fullName" | "dateOfBirth" | "birthTime" | "lifeStages";

const LIFE_STAGE_KEYS: LifeStageOption[] = [
  "exploring",
  "building_career",
  "in_relationship",
  "married",
  "parent",
  "empty_nester",
  "retired",
  "prefer_not_to_say",
];

const optionStyles =
  "min-h-11 px-3 py-2 rounded-md border text-sm text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-base";

function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function InputWizard({ onSubmit, isLoading }: InputWizardProps) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [formData, setFormData] = useState<WizardData>(EMPTY_FORM);
  const [showMore, setShowMore] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stepChanged = useRef(false);
  const startedRef = useRef(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        const restored = { ...EMPTY_FORM, ...JSON.parse(saved) };
        setFormData(restored);
        if (restored.gender) setShowMore(true);
      }
    } catch {
      // Ignore corrupt storage.
    }
  }, []);

  // Autofocus only with a fine pointer: on phones it would pop the keyboard
  // over the hero before the visitor has read what the product is.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) {
      nameRef.current?.focus({ preventScroll: true });
    }
  }, []);

  // Move focus to the new step's heading so keyboard and screen-reader users
  // keep their place, and bring the step into view on small screens.
  useEffect(() => {
    if (!stepChanged.current) return;
    headingRef.current?.focus({ preventScroll: true });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    formRef.current?.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
  }, [step]);

  const updateField = useCallback(
    <K extends keyof WizardData>(field: K, value: WizardData[K]) => {
      if (!startedRef.current) {
        startedRef.current = true;
        track("form_start", { field });
      }
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

  const touch = (field: FieldKey) =>
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));

  const dobInRange = (dob: string) => dob >= DOB_MIN && dob <= todayISO();

  const errors: Record<FieldKey, string | undefined> = {
    fullName: formData.fullName.trim() === "" ? t.wizard.errNameRequired : undefined,
    dateOfBirth:
      formData.dateOfBirth.replace(/-/g, "") === ""
        ? t.wizard.errDobRequired
        : !isCompleteDob(formData.dateOfBirth)
          ? t.wizard.errDobIncomplete
          : !isRealDate(formData.dateOfBirth)
            ? t.wizard.errDobInvalid
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

  const hasInput: Record<FieldKey, boolean> = {
    fullName: formData.fullName.trim() !== "",
    dateOfBirth: formData.dateOfBirth.replace(/-/g, "") !== "",
    birthTime: formData.birthTime !== "",
    lifeStages: formData.lifeStages.length > 0,
  };

  // Format errors show when the user leaves a field they've typed in;
  // "required" errors wait for Continue. Flagging an empty field on blur
  // shifted the layout mid-click, so the first Continue click missed.
  const shownError = (field: FieldKey) =>
    attempted || (touched[field] && hasInput[field]) ? errors[field] : undefined;

  const stepFields: FieldKey[][] = [
    ["fullName", "dateOfBirth", "birthTime"],
    ["lifeStages"],
  ];
  const stepValid = (currentStep: number) =>
    stepFields[currentStep].every((field) => !errors[field]);

  const goToStep = (next: number) => {
    stepChanged.current = true;
    setAttempted(false);
    setStep(next);
  };

  const handleNext = () => {
    track("cta_click", { step: step + 1 });
    if (!stepValid(step)) {
      setAttempted(true);
      for (const field of stepFields[step]) {
        if (errors[field]) track("field_error", { field, step: step + 1 });
      }
      // Focus the first invalid control so the user lands on the problem.
      requestAnimationFrame(() => {
        const firstInvalid = formRef.current?.querySelector<HTMLElement>(
          '[aria-invalid="true"], [data-invalid="true"] button'
        );
        firstInvalid?.focus();
      });
      return;
    }
    track("form_step_complete", { step: step + 1 });
    if (step < TOTAL_STEPS - 1) goToStep(step + 1);
    else onSubmit(formData);
  };

  // Native form submission: Enter in a text field advances/submits, while
  // Enter/Space on tile buttons keeps its normal toggle behaviour.
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isLoading) handleNext();
  };

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

  const stepTitles = [t.wizard.step1Title, t.wizard.step2Title];
  const timeHelpId = "birth-time-help";
  const placeTypedNotPicked =
    formData.birthPlace.trim().length > 1 && !formData.birthCoords;

  return (
    <form
      ref={formRef}
      className="w-full scroll-mt-14"
      onSubmit={handleFormSubmit}
      noValidate
      aria-labelledby="wizard-step-title"
    >
      <div className="card p-5 sm:p-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <p className="font-mono text-xs tracking-wider uppercase text-ink-muted number-mono">
                {formatMessage(t.wizard.stepOf, {
                  current: step + 1,
                  total: TOTAL_STEPS,
                })}
              </p>
              <h2
                id="wizard-step-title"
                ref={headingRef}
                tabIndex={-1}
                className="text-lg text-ink mt-1 focus:outline-none"
              >
                {stepTitles[step]}
              </h2>
            </div>
            {step > 0 && (
              <button
                type="button"
                onClick={() => goToStep(step - 1)}
                className="min-h-11 -mr-2 px-2 font-mono text-xs tracking-wider uppercase text-ink-muted hover:text-ink transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                ← {t.wizard.back}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5" aria-hidden="true">
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1 rounded-full transition-colors duration-300",
                  index <= step ? "bg-ink" : "bg-line-muted"
                )}
              />
            ))}
          </div>
        </div>

        <div key={step} className="space-y-6 animate-fade-in-up">
          {step === 0 && (
            <>
              <Input
                ref={nameRef}
                label={t.wizard.fullNameLabel}
                type="text"
                value={formData.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                onBlur={() => touch("fullName")}
                placeholder={t.wizard.fullNamePlaceholder}
                error={shownError("fullName")}
                autoComplete="name"
                autoCapitalize="words"
                spellCheck={false}
                enterKeyHint="next"
              />
              <DateOfBirthInput
                label={t.wizard.dobLabel}
                value={formData.dateOfBirth}
                onChange={(value) => updateField("dateOfBirth", value)}
                onBlur={() => touch("dateOfBirth")}
                error={shownError("dateOfBirth")}
              />
              <div>
                <div className="flex items-end justify-between gap-3 mb-2">
                  <FieldLabel hint={t.wizard.birthTimeOptional}>
                    {t.wizard.birthTimeLabel}
                  </FieldLabel>
                  <label className="-my-3 -mr-1 flex min-h-11 items-center gap-2 px-1 text-sm text-ink-secondary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.dontKnowBirthTime}
                      onChange={(event) => {
                        updateField("dontKnowBirthTime", event.target.checked);
                        if (event.target.checked) updateField("birthTime", "");
                      }}
                      className="h-4 w-4 accent-current"
                    />
                    {t.wizard.iDontKnow}
                  </label>
                </div>
                {!formData.dontKnowBirthTime && (
                  <>
                    <TimeInput
                      ariaLabel={t.wizard.birthTimeLabel}
                      value={formData.birthTime}
                      onChange={(value) => updateField("birthTime", value)}
                      onBlur={() => touch("birthTime")}
                      describedBy={timeHelpId}
                      error={shownError("birthTime")}
                    />
                    <p id={timeHelpId} className="text-xs text-ink-muted mt-1.5">
                      {t.wizard.birthTimeHelp}
                    </p>
                  </>
                )}
              </div>
              <PlaceAutocomplete
                label={t.wizard.birthPlaceLabel}
                value={formData.birthPlace}
                onChange={(value) => {
                  updateField("birthPlace", value);
                  if (formData.birthCoords) updateField("birthCoords", null);
                }}
                onSelect={(suggestion) =>
                  updateField("birthCoords", {
                    latitude: suggestion.latitude,
                    longitude: suggestion.longitude,
                  })
                }
                placeholder={t.wizard.birthPlacePlaceholder}
                hint={placeTypedNotPicked ? t.wizard.placeHint : undefined}
              />
            </>
          )}

          {step === 1 && (
            <>
              <div data-invalid={shownError("lifeStages") ? "true" : undefined}>
                <FieldLabel hint={t.wizard.lifeStageHint}>
                  {t.wizard.lifeStageLabel}
                </FieldLabel>
                <div
                  role="group"
                  aria-label={t.wizard.lifeStageLabel}
                  aria-describedby={shownError("lifeStages") ? "life-stage-error" : undefined}
                  className="grid grid-cols-2 gap-2"
                >
                  {LIFE_STAGE_KEYS.map((key) => {
                    const selected = formData.lifeStages.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        role="checkbox"
                        aria-checked={selected}
                        onClick={() => toggleLifeStage(key)}
                        className={cn(
                          optionStyles,
                          "flex items-center gap-2",
                          selected
                            ? "bg-ink text-base border-ink"
                            : "border-line text-ink-secondary hover:bg-panel hover:text-ink hover:border-ink-muted"
                        )}
                      >
                        <span aria-hidden="true" className="font-mono text-xs w-3 shrink-0">
                          {selected ? "✓" : ""}
                        </span>
                        {t.lifeStages[key]}
                      </button>
                    );
                  })}
                </div>
                <FieldError id="life-stage-error">{shownError("lifeStages")}</FieldError>
              </div>

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
                  enterKeyHint="enter"
                />
                <span className="font-mono text-xs text-ink-muted mt-1.5 block text-right number-mono">
                  {formData.whatsOnYourMind.length}/200
                </span>
              </div>

              <div>
                <button
                  type="button"
                  aria-expanded={showMore}
                  aria-controls="wizard-more"
                  onClick={() => setShowMore((open) => !open)}
                  className="min-h-11 -ml-1 px-1 flex items-center gap-2 font-mono text-xs tracking-wider uppercase text-ink-muted hover:text-ink transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                >
                  <span aria-hidden="true">{showMore ? "−" : "+"}</span>
                  {t.wizard.moreDetail}
                  <span className="normal-case">{t.wizard.genderOptional}</span>
                </button>
                {showMore && (
                  <div id="wizard-more" className="pt-3 animate-fade-in">
                    <FieldLabel>{t.wizard.genderLabel}</FieldLabel>
                    <div
                      role="radiogroup"
                      aria-label={t.wizard.genderLabel}
                      className="flex gap-2 flex-wrap"
                    >
                      {genderOptions.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          role="radio"
                          aria-checked={formData.gender === option.key}
                          onClick={() =>
                            updateField(
                              "gender",
                              formData.gender === option.key ? "" : option.key
                            )
                          }
                          className={cn(
                            optionStyles,
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
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sticky on phones so the next step is always one thumb away. */}
      <div className="sticky bottom-0 z-10 -mx-4 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-base via-base to-base/0 sm:static sm:mx-0 sm:px-0 sm:pt-6 sm:pb-0 sm:bg-none">
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          aria-busy={isLoading || undefined}
          className="w-full min-h-12"
        >
          {isLoading && (
            <span
              aria-hidden="true"
              className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin"
            />
          )}
          {isLoading
            ? t.wizard.loading
            : step === TOTAL_STEPS - 1
              ? t.wizard.reveal
              : `${t.wizard.continue} →`}
        </Button>
        <p className="mt-3 text-center text-xs text-ink-muted">{t.wizard.reassurance}</p>
      </div>
    </form>
  );
}
