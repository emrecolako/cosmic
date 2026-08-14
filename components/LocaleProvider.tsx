"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getMessages, type Locale, type Messages } from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  t: Messages;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ locale, t: getMessages(locale) }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useI18n must be used within a LocaleProvider");
  }
  return context;
}
