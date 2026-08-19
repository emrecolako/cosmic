# Cosmic Blueprint — portable skill package

The logic of this app, extracted into a form you can hand to another agent
(Grokbot or anything else that takes a skill folder), plus a daily-reading design
the web app does not have.

```
docs/grokbot-skill/
├── SKILL.md                        the skill itself — persona, flow, guardrails
├── reference/
│   ├── calculations.md             every formula, with worked examples
│   ├── interpretations.md          all interpretation tables (generated)
│   └── daily-reading.md            the daily reading engine and message design
└── scripts/
    ├── cosmic.py                   the calculation engine, stdlib-only Python 3.10+
    └── gen-interpretations.ts      regenerates the tables from lib/ (dev only)
```

Ship `SKILL.md`, `reference/` and `cosmic.py`. `gen-interpretations.ts` stays in
this repo — it needs `lib/`, so it is not useful to the receiving agent.

## Handing it over

Upload the whole folder. `SKILL.md` is the entry point and points at the rest;
the reference files are meant to be read on demand rather than all at once.

If the target platform cannot execute code, `reference/calculations.md` has every
formula written out longhand — but the moon and rising sign will not survive
mental arithmetic, so the skill tells the agent to say so rather than guess.

## Parity with the app

`scripts/cosmic.py` is a port of `lib/numerology.ts`, `lib/chinese-zodiac.ts`,
`lib/western-astrology.ts` and `lib/life-stages.ts`. It was verified against the
TypeScript across eight birth profiles chosen to hit the edge cases — master
numbers, diacritics and non-decomposing letters (ø, ł), a Lunar New Year boundary
birth, an unknown birth time, a moon that changes sign mid-day, a southern
latitude, a half-hour timezone — and produced identical output on every field.

`reference/interpretations.md` is generated from the TypeScript source rather than
transcribed, so the titles and keywords cannot drift.

Two things in the Python are **not** in the web app, because the daily reading
needs them: Personal Month / Personal Day / Universal Day numbers, and the
transit-side calculations (moon phase, day pillar, today's moon sign). The day
pillar is anchored so 2000-01-07 is a Jia-Zi day, the standard reference.

## What is deliberately not carried over

- **Timezone resolution.** The app maps birth coordinates to an IANA zone with
  `tz-lookup` and asks `Intl` for the historical offset. The port takes the offset
  as a `--tz` argument instead — whoever runs it has to supply it. This matters:
  a wrong historical offset moves the rising sign by a whole sign.
- **Geocoding.** Same reason — the app calls a geocoding service for birth-city
  coordinates. Pass `--lat` / `--lon`, or skip the rising sign.
- **i18n.** The app ships seven locales of UI and interpretation text. The skill
  tells the agent to answer in whatever language the user writes in, which is a
  better fit for chat than translated fixed strings.
- **The streaming AI reading.** The app builds a prompt and streams four
  marker-delimited sections back from OpenRouter. In a chat skill the agent *is*
  the model, so `SKILL.md` carries the same instructions as direct guidance
  instead of as a prompt to send somewhere.

## Regenerating the interpretation tables

If the interpretation text in `lib/numerology.ts` changes, regenerate rather than
hand-editing:

```bash
npx tsx docs/grokbot-skill/scripts/gen-interpretations.ts \
    > docs/grokbot-skill/reference/interpretations.md
```
