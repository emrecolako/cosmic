export const SUPPORTED_LOCALES = ["en", "tr", "es", "fr", "de", "pt", "it"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

const supported = new Set<string>(SUPPORTED_LOCALES);

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && supported.has(value.toLowerCase());
}

export function negotiateLocale(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  const candidates = header
    .split(",")
    .map((entry, index) => {
      const [rawTag, ...params] = entry.trim().split(";");
      const qParam = params.find((p) => p.trim().toLowerCase().startsWith("q="));
      const parsedQ = qParam ? Number(qParam.trim().slice(2)) : 1;
      const q = Number.isFinite(parsedQ) ? Math.max(0, Math.min(1, parsedQ)) : 0;
      return { tag: rawTag.trim().toLowerCase(), q, index };
    })
    .filter(({ tag, q }) => tag && tag !== "*" && q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);

  for (const { tag } of candidates) {
    if (supported.has(tag)) return tag as Locale;
    const primary = tag.split("-")[0];
    if (supported.has(primary)) return primary as Locale;
  }

  return DEFAULT_LOCALE;
}

export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  tr: "Turkish",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  it: "Italian",
};
