# Reading output eval

Run `npx tsx scripts/evals/reading.ts output.txt fixture.json`. The command prints JSON and exits 0 when every hard check passes, 1 on a failed check, or 2 on an input error. Run `npx tsx scripts/evals/reading.test.ts` for the positive and negative examples.

The fixture format is:

```json
{
  "scope": "full",
  "locale": "en",
  "birthTimeKnown": false,
  "facts": { "lifePath": 7, "sunSign": "Scorpio", "chineseAnimal": "Horse", "personalYear": 7 },
  "lifeStageTerms": ["career", "work"]
}
```

Use the exact calculated values sent in the prompt. Never use a real person's birth details in a committed fixture. The hard checks cover parser markers, section lengths, bullet format, a few grounded facts, and unsupported precision. They are designed for English output; the current CLI rejects other locales. A passing result is a format and basic grounding gate, not proof that every statement is correct. Have a reviewer score each of the five 0–2 editorial criteria in the JSON result. For stronger confidence, compare models across several profiles, including known and unknown birth times, with blind editorial review.
