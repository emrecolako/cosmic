import { en, type Messages } from "./en";
import { tr } from "./tr";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { pt } from "./pt";
import { it } from "./it";
import type { Locale } from "./locales";

const catalogs: Record<Locale, Messages> = { en, tr, es, fr, de, pt, it };

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? en;
}

export function formatMessage(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  );
}

export { en };
export type { Messages };
export * from "./locales";
