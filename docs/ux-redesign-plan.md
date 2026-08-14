# Cosmic UX Redesign Plan — bezos-1000 style adoption

Goal: fix the UX of the cosmic app and restyle it using the **exact** design system from
[bezos-1000](https://github.com/emrecolako/bezos-1000) (bezos-1000.vercel.app) — monochrome,
IBM Plex, terminal/data-sheet aesthetic.

> **Note:** this replaces the navy/gold/Playfair "celestial" identity specified in CLAUDE.md's
> Design Guidelines. Update that section of CLAUDE.md as part of Phase 1 so future sessions
> don't fight the new direction.

---

## 0. The design language being adopted (extracted verbatim from bezos-1000)

**Fonts** (via `next/font`, not Google Fonts `<link>`):
- `IBM_Plex_Sans` → `--font-ibm-plex-sans` (weights 100–700), body font
- `IBM_Plex_Mono` → `--font-ibm-plex-mono` (weights 300–600), all labels, numbers, buttons

**Theme tokens** (CSS variables, light default + `.dark` class):

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#ffffff` | `#000000` |
| `--bg-secondary` | `#f4f4f5` | `#18181b` |
| `--text` | `#000000` | `#ffffff` |
| `--text-secondary` | `#27272a` | `#d4d4d8` |
| `--text-muted` | `#52525b` | `#a1a1aa` |
| `--border` | `#d4d4d8` | `#3f3f46` |
| `--border-muted` | `#e4e4e7` | `#27272a` |

Plus `color-scheme: light|dark`. Palette alias: `primary`/`surface` = Tailwind `zinc`. Cosmic
stays **dark by default** with a `[LIGHT]`/`[DARK]` toggle in the header.

**Signature patterns:**
- Fixed 40px-tall header (`h-10`), `font-mono text-xs tracking-wider`, actions as bracketed
  uppercase text buttons: `[DARK]` `[SHARE]` `[TR]` — `hover:opacity-70`, no icons.
- Hero: uppercase mono headline with `tracking-wider`, muted uppercase subcopy, and a
  "PARAMETERS" stat block — `p-4 rounded-lg` on `var(--bg-secondary)`, rows of
  `w-32` muted label + `tabular-nums` value.
- Buttons (port `components/ui/Button.tsx` as-is): primary = inverted `bg-white text-black
  hover:bg-zinc-200`; secondary/outline = `border-white/10..20` + `hover:bg-white/5`; ghost.
  Focus ring: `ring-2 ring-white ring-offset-black`. Sizes sm/md/lg.
- Cards: **ghost** — no border, no background, `px-0` headers/content (port `ui/Card.tsx`).
  Bordered variant only where separation is needed: `1px solid var(--border-muted)`,
  hover → `var(--border)`. Shadows are effectively banned (`soft: none`; "elevated" =
  1px white ring + `0 4px 12px rgba(0,0,0,0.5)`).
- Toasts (port `ui/Toast.tsx`): fixed bottom-right, mono uppercase, `OK:`/`ERROR:` prefix,
  `[×]` dismiss, 3s auto-dismiss, 0.15s slide.
- Skeletons: `animate-pulse` on `var(--bg-secondary)`; shaped like the real layout.
- Motion: `fade-in` / `fade-in-up` 0.5s ease-out, `shimmer` 2s, `count-up` 0.6s for stats.
  Nothing bouncy, nothing slower than 0.6s.
- Numbers always `font-mono` + `font-variant-numeric: tabular-nums` (`.number-mono`).
- `.scrollbar-thin` custom scrollbars.

**Tailwind v4 translation:** cosmic uses Tailwind v4 (CSS-first); bezos-1000 is v3 with
`tailwind.config.ts`. Translate: colors/fonts/keyframes → `@theme` in `globals.css`;
class-based dark mode → `@custom-variant dark (&:where(.dark, .dark *));`.

---

## Phase 1 — Port the design system (foundation)

1. **Rewrite `app/globals.css`**: replace the navy/gold `@theme` with the token table above,
   the four keyframes, and component classes `.card`, `.btn`, `.skeleton`, `.number-mono`,
   `.scrollbar-thin`. Delete `.glass-card`, `.glow-gold`, `.glow-purple`.
2. **Rewrite `app/layout.tsx`**: `next/font` IBM Plex Sans/Mono (kills the render-blocking
   Google Fonts `<link>` and serif FOUT), `suppressHydrationWarning`, dark default via `.dark`
   on `<html>` with toggle support, `lang` driven by locale (currently hardcoded `"en"` even
   for TR).
3. **Create `components/ui/`** ported from bezos-1000: `Button`, `Card`, `Skeleton`, `Toast`
   (+ `ToastProvider` in layout), plus a matching `Input`/`Select` (mono text, `var(--border)`
   borders, white focus ring) which bezos-1000's Input can seed.
4. **New `components/Header.tsx`**: fixed h-10 mono header — `COSMIC-BLUEPRINT` left;
   `[LIGHT|DARK]` `[EN|TR]` `[SHARE]` right. Replaces the language-toggle markup currently
   copy-pasted in `app/page.tsx:45-66` and `app/results/page.tsx:204-225`.
5. **Delete `components/StarField.tsx`** (both pages). Off-style for the monochrome aesthetic
   and a real perf bug: uncapped rAF loop, no pause on tab-hide, no reduced-motion, re-inits
   on every resize. Background becomes plain `var(--bg)`.
6. **Update CLAUDE.md** Design Guidelines to the new system.

## Phase 2 — Restyle the two screens

**Landing + wizard** (`app/page.tsx`, `components/InputWizard.tsx`):
- Hero in bezos style: `COSMIC BLUEPRINT` mono headline + muted uppercase one-liner.
- Wizard as a bordered `.card`; step indicator as mono `STEP 01 / 02` with `aria-current`.
- Life-stage / gender pickers → uppercase mono outline buttons; selected = inverted
  (primary variant), not gold-tint-only. Emoji removed or `aria-hidden` decorative.
- Fix the step-height jump (`min-h-[380px]` at `InputWizard.tsx:107`) — auto height +
  framer `layout` animation.
- Submit button = primary (white/black inverted), full width, `GENERATE READING`.

**Results** (`app/results/page.tsx` — 544 lines, split it):
- Extract into `CosmicProfile.tsx` (layout) + per-section components; collapse the four
  near-identical numerology IIFE blocks (`results/page.tsx:317-368`) into one
  `NumberStat` component.
- Sections restyled as a data sheet: mono uppercase section headers (`01 / THE NUMBERS` —
  the numbering already exists, it fits the aesthetic perfectly), numerology numbers as
  PARAMETERS-style stat blocks (`bg-secondary`, `tabular-nums`, `animate-count-up`).
- `NatalChartVisual`: monochrome — `var(--text)` / `var(--text-muted)` / opacity strokes
  instead of `#4a4e7a` + gold/purple/teal hardcodes; same for `CosmicToolkit.tsx:10` and
  `WesternAstroCard` color arrays.
- Skeletons reshaped to mirror each real section, widths fixed (currently `Math.random()`
  in `CombinedAnalysis.tsx:23,28` — they jump every re-render).
- Errors/confirmations via the ported Toast.

## Phase 3 — Flow & architecture fixes (the big UX wins)

1. **Progressive reveal** (CLAUDE.md requires it; currently everything blocks ~10-30s on one
   API blob). Move numerology/zodiac/astrology calcs **client-side** — `lib/` is pure and
   CLAUDE.md's privacy note explicitly endorses this. Sections 01–03 + 05–06 render in
   <1s; only section 04 (Unified Reading) hits `/api/generate-reading`, now slimmed to
   analysis-only, **streamed** (SSE/ReadableStream) so text appears as Claude writes it.
2. **PII out of the URL.** Name, DOB, birth time/place, gender, and free-text worries are
   currently serialized into the query string (`app/page.tsx:26-36`) — history/log leakage,
   contradicts CLAUDE.md privacy. Hand off via `sessionStorage`; `/results` redirects home
   when the payload is missing. (Also restores back-button friendliness.)
3. **Retry retries only the analysis** — `CombinedAnalysis`'s `onRetry` currently re-runs the
   entire request; with the split API this becomes free.
4. **Fix the broken language toggle on results** (`results/page.tsx:90-94` reverts any locale
   change because the URL `lang` param wins; and locale is a dep of `fetchReading`, so a
   toggle also re-burns a Claude call). Locale lives in the i18n provider + URL together;
   UI strings switch instantly; regenerating the *reading* in the other language happens only
   behind an explicit `[REGENERATE IN TURKISH]` action.
5. **Geocode failure feedback**: unrecognized birth place currently silently drops moon/rising
   (route.ts:160-183). Surface a toast/inline note: `PLACE NOT RECOGNIZED — SHOWING SOLAR CHART`.
6. Fix hydration locale flash (`I18nProvider` detects locale in `useEffect` → English frame
   first for TR users): read locale in a cookie/inline script before paint.

## Phase 4 — Form correctness

- Inline validation messages (there are none — buttons just disable): name required, DOB
  required + `min`/`max` on the date input (1900–today) so bad dates fail in the form, not
  as a full-page error on `/results` that discards everything typed.
- **Enter-key bug**: the wrapper-div `onKeyDown` (`InputWizard.tsx:58-63,84`) submits the form
  when the user presses Enter for a newline in the textarea. Scope Enter-to-advance to
  non-textarea targets.
- Persist form state to `sessionStorage` so "Start over" and validation errors restore input.

## Phase 5 — Accessibility (currently zero — no aria/role/reduced-motion anywhere)

- Life-stage/gender groups → `role="radiogroup"` + `aria-checked`; selection no longer
  color-only (inverted button solves this).
- `aria-current` on steps; real labels on emoji and the natal-chart SVG (`<title>` + `aria-label`).
- Contrast: replace `text-cream/25–40` on near-black with the token scale — `--text-muted`
  (zinc-400 on black ≈ 7:1) is the floor for body text.
- `prefers-reduced-motion`: disable framer entrance animations and count-up.
- `html lang` follows locale (Phase 1.2).

## Phase 6 — Share (deferred nice-to-have)

`[SHARE]` in the header, bezos-style clipboard copy + `LINK COPIED` toast. Since PII leaves
the URL in Phase 3, a shareable link needs a server-side reading ID or an OG-image route —
scope as v2; ship the header button as "copy app link" first.

---

## Sequencing & scope

| Phase | Touches | Size |
|---|---|---|
| 1. Design system | globals.css, layout.tsx, new ui/, Header, delete StarField | ~1 session |
| 2. Restyle screens | page.tsx, results split, 6 components | largest visual chunk |
| 3. Flow fixes | api route, results data flow, i18n | highest UX value |
| 4. Form | InputWizard | small |
| 5. A11y | sweep across components | small-medium |
| 6. Share | header + optional OG route | optional |

Phases 1→2 are the "exact bezos styles" ask; Phase 3 is the biggest felt-UX improvement
(seconds-to-first-content drops from ~15-30s to <1s). `lib/` calculation code stays untouched
except for slimming the API response. Verify with `npm run verify` + manual pass on mobile
viewport, both themes, both locales.
