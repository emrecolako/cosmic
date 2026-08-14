export const SUPPORTED_LOCALES = ["en", "tr", "es", "fr", "de", "pt", "it"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

const supportedLocales = new Set<string>(SUPPORTED_LOCALES);

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && supportedLocales.has(value);
}

/**
 * Negotiate the best supported locale from an Accept-Language header.
 * Region variants are matched by primary subtag (pt-BR -> pt, es-419 -> es),
 * q=0 entries are ignored, and ties retain their original header order.
 */
export function negotiateLocale(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  const ranges = header
    .split(",")
    .map((part, index) => {
      const [rawRange, ...parameters] = part.trim().split(";");
      const range = rawRange.trim().toLowerCase();
      if (!range) return null;

      let quality = 1;
      const qParameter = parameters.find((parameter) =>
        parameter.trim().toLowerCase().startsWith("q=")
      );
      if (qParameter) {
        const parsed = Number.parseFloat(qParameter.split("=")[1]);
        quality = Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 0;
      }

      return { range, quality, index };
    })
    .filter((entry): entry is { range: string; quality: number; index: number } =>
      entry !== null && entry.quality > 0
    )
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const { range } of ranges) {
    if (range === "*") continue;
    if (isLocale(range)) return range;

    const primarySubtag = range.split("-")[0];
    if (isLocale(primarySubtag)) return primarySubtag;
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
