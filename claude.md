# Cosmic Blueprint — Numerology & Astrology Platform

## Project Overview

A single-page web application that takes a user's birth details and life context, then generates a **unified cosmic profile** combining numerology, Western astrology, Chinese astrology, and natal chart analysis. The output is a beautifully designed, digestible report that adapts its tone and relevance based on the user's life stage.

This is NOT a generic horoscope site. It's a **personal synthesis engine** — the magic is in the combined interpretation, not isolated readings.

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + Framer Motion for animations
- **AI Backend:** Anthropic Claude API (claude-sonnet-4-5-20250929) for combined analysis generation
- **Astrology Calculations:** Use `astronomia` or `swisseph` npm packages for natal chart math. Fallback: pre-computed lookup tables for sun/moon/rising if ephemeris is too heavy.
- **Numerology:** Pure math — implement from scratch (no library needed)
- **Chinese Zodiac:** Lookup table with Lunar New Year date boundaries
- **Deployment:** Vercel
- **State Management:** React state + URL params (no Redux needed)

---

## Architecture

```
/app
  /page.tsx              → Landing + input form
  /results/page.tsx      → Full cosmic profile report
/components
  /InputWizard.tsx       → Multi-step form (birth info → life context)
  /CosmicProfile.tsx     → Main report layout
  /NumerologyCard.tsx    → Life path, expression, soul urge numbers
  /WesternAstroCard.tsx  → Sun, moon, rising + key aspects
  /ChineseZodiacCard.tsx → Animal + element + yin-yang
  /NatalChartVisual.tsx  → SVG or canvas natal chart wheel
  /CombinedAnalysis.tsx  → The AI-generated unified reading
  /LifeStageAdapter.tsx  → Context-aware wrapper that adjusts framing
/lib
  /numerology.ts         → All numerology calculations
  /western-astrology.ts  → Zodiac sign lookups, basic natal chart
  /chinese-zodiac.ts     → Chinese zodiac calculations
  /natal-chart.ts        → Planet position calculations
  /analysis-prompt.ts    → Claude API prompt builder
  /life-stages.ts        → Life stage classification logic
/api
  /generate-reading/route.ts → Claude API endpoint
```

---

## Core Features

### 1. Input Collection (Multi-Step Wizard)

**Step 1 — Birth Details:**
- Full name (as given at birth) → for numerology
- Date of birth (day/month/year) → for everything
- Time of birth (optional, with "I don't know" option) → for natal chart precision
- Place of birth (city) → for natal chart house calculations

**Step 2 — Life Context:**
- Age range auto-detected from DOB, but also ask:
  - Current life stage: "Exploring life" / "Building career" / "In a relationship" / "Married" / "Parent" / "Empty nester" / "Retired" / "Prefer not to say"
  - Optional: What's on your mind? (free text, 1-2 sentences) → seeds the combined analysis with personal relevance
  - Gender (optional, for traditional astrology accuracy)

### 2. Individual Readings

**Numerology:**
- Life Path Number (reduce DOB to single digit or master number 11/22/33)
- Expression/Destiny Number (full birth name → Pythagorean system)
- Soul Urge/Heart's Desire Number (vowels of birth name)
- Personality Number (consonants of birth name)
- Current Personal Year number
- Brief interpretation for each

**Western Astrology:**
- Sun sign + decan
- Moon sign (if birth time provided)
- Rising/Ascendant sign (if birth time + location provided)
- Key planetary aspects (major ones only — conjunctions, oppositions, trines)
- Current transits relevant to their sun sign

**Chinese Astrology:**
- Animal sign (with proper Lunar New Year boundary handling — NOT just calendar year)
- Element (Wood, Fire, Earth, Metal, Water)
- Yin/Yang polarity
- Brief personality profile
- Current year compatibility

**Natal Chart:**
- Visual chart wheel (SVG) showing planet positions in houses
- If no birth time: show sun-sign-centered chart with disclaimer
- Key aspects highlighted visually
- House placements for major planets

### 3. Combined Analysis (The Core Product)

This is the section that makes the app unique. Use Claude API to generate a **unified narrative** that:

- Finds the **threads** connecting all systems (e.g., "Your Life Path 7 and Scorpio sun both point to deep investigative energy...")
- Identifies **reinforcing patterns** (where multiple systems agree)
- Calls out **tensions** (where systems suggest opposing tendencies — frame as complexity, not contradiction)
- Adapts language and focus based on life stage:
  - **Young/Exploring:** Focus on identity discovery, potential, what to lean into
  - **Career building:** Focus on strengths, leadership style, professional compatibility
  - **In relationship/Married:** Focus on relational dynamics, communication style, emotional needs
  - **Parent:** Focus on nurturing style, family dynamics, balancing self with caretaking
  - **Later life:** Focus on wisdom integration, legacy, what to release vs. embrace
- Includes **actionable insights** — not just "you are X" but "consider trying Y"
- Uses a warm, intelligent tone — NOT woo-woo, NOT clinical. Think: wise friend who reads a lot.

### 4. Report Sections (Final Output)

The report should flow like this:

1. **Your Cosmic Snapshot** — One-paragraph executive summary
2. **The Numbers** — Numerology breakdown with visual number cards
3. **Your Star Map** — Western astrology with natal chart visual
4. **Your Eastern Mirror** — Chinese zodiac profile
5. **The Unified Reading** — AI-generated combined analysis (longest section)
6. **This Season For You** — Current transits + personal year = what's active now
7. **Your Cosmic Toolkit** — 3-5 practical takeaways based on everything above

---

## Design Guidelines

### Visual Identity
- **Palette:** Deep navy/indigo (#0a0e27) background, gold (#d4a853) accents, soft white text, subtle purple (#6c5ce7) and teal (#00b894) for data viz
- **Typography:** Serif heading font (e.g., Playfair Display or Cormorant Garamond), clean sans-serif body (Inter or DM Sans)
- **Aesthetic:** Celestial but modern. Think: if Stripe designed an astrology app. No clip-art moons. No Comic Sans. No generic galaxy backgrounds.
- **Animations:** Subtle constellation-like particle effects on landing. Cards fade/slide in on scroll. Chart wheel draws in with animation.

### UX Principles
- The input form should feel like a ritual, not a survey — use transitions, micro-animations
- Results should be progressively revealed (skeleton loading → sections appear as generated)
- Mobile-first — the report must read beautifully on phone
- Include share functionality (generate OG image with cosmic snapshot summary)
- Dark mode by default (it's a cosmic app), optional light mode

---

## Claude API Prompt Strategy

The combined analysis prompt should be structured as:

```
System: You are a master astrologer and numerologist who synthesizes multiple 
cosmic systems into unified, practical wisdom. You write with warmth and 
intelligence — never vague, never preachy. You acknowledge that these are 
interpretive frameworks, not deterministic predictions. You adapt your advice 
to the person's actual life context.

User: [Structured data payload with all calculated values + life stage context]
```

The prompt in `/lib/analysis-prompt.ts` should dynamically build based on:
- Which data points are available (birth time known vs. unknown)
- Life stage selected
- Optional "what's on your mind" input
- Personal year number (for timing-relevant advice)

---

## Important Implementation Notes

1. **Master Numbers:** In numerology, NEVER reduce 11, 22, or 33. These are master numbers with special significance.

2. **Lunar New Year Boundaries:** Chinese zodiac years start at Lunar New Year, NOT January 1. People born in January/February need date-checked against that year's Lunar New Year date. Use a lookup table for 1924-2044.

3. **Birth Time Unknown:** If no birth time, skip moon sign, rising sign, and house placements. Show the natal chart as a "solar chart" (sun on ascendant) with clear labeling that it's approximate.

4. **Numerology Letter Values (Pythagorean):**
   ```
   1: A, J, S
   2: B, K, T
   3: C, L, U
   4: D, M, V
   5: E, N, W
   6: F, O, X
   7: G, P, Y
   8: H, Q, Z
   9: I, R
   ```

5. **Rate Limiting:** Cache Claude API responses by input hash. Same birthday + same life stage = same reading (within 24h). Don't burn tokens on duplicate requests.

6. **Error Handling:** If Claude API fails, still show all the calculated data (numerology, signs, chart). Only the combined analysis section should show a retry option.

7. **Privacy:** Don't store birth data server-side beyond the session. All calculations can happen client-side except the Claude API call.

---

## Performance Targets

- Landing page: < 1.5s LCP
- Time to first result section: < 3s after form submission
- Full report with AI analysis: < 15s total
- Natal chart render: < 500ms

---

## Out of Scope (for v1)

- User accounts / saved readings
- Compatibility readings (two people)
- Daily/weekly horoscopes
- Payment / premium tiers
- PDF export (nice-to-have for v2)
