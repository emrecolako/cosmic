/** Whether birth details were given, as booleans only; the values themselves are never sent to analytics or Stripe. */
export function birthDataFlags(input: { birthTime?: unknown; birthPlace?: unknown }): {
  has_birth_time: boolean;
  birth_time_unknown: boolean;
  has_birth_place: boolean;
} {
  const hasTime = Boolean(input.birthTime);
  return { has_birth_time: hasTime, birth_time_unknown: !hasTime, has_birth_place: Boolean(String(input.birthPlace ?? "").trim()) };
}

/** Reads the flags back from Stripe metadata strings. */
export function birthFlagsFromMetadata(metadata: Record<string, string>): Partial<Record<keyof ReturnType<typeof birthDataFlags>, boolean>> {
  const keys = ["has_birth_time", "birth_time_unknown", "has_birth_place"] as const;
  return Object.fromEntries(keys.filter((k) => k in metadata).map((k) => [k, metadata[k] === "true"]));
}
