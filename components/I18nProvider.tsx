"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { detectLocale, getTranslations, Locale, Translations } from "@/lib/i18n";
import { tr } from "@/lib/i18n/tr";

interface I18nContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  t: tr, // use tr as the shape reference
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [translations, setTranslations] = useState<Translations>(getTranslations("en"));

  useEffect(() => {
    const detected = detectLocale();
    setLocaleState(detected);
    setTranslations(getTranslations(detected));
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setTranslations(getTranslations(newLocale));
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t: translations, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
