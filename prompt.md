# Build Prompt — Cosmic Blueprint

Use this as your initial prompt to Claude Code (or any AI coding assistant) after placing the `claude.md` in your project root.

---

## The Prompt

```
Build "Cosmic Blueprint" — a Next.js web app that generates a unified cosmic profile from a user's birth details. Read the claude.md for full architecture and specs.

Here's the build order:

### Phase 1: Calculation Engine (no UI yet)

Build the pure logic first in `/lib`:

1. **numerology.ts** — Implement Pythagorean numerology:
   - `calculateLifePath(dateOfBirth: Date): number` — reduce DOB to single digit, preserving master numbers (11, 22, 33)
   - `calculateExpression(fullName: string): number` — full birth name letter values summed and reduced
   - `calculateSoulUrge(fullName: string): number` — vowels only (A, E, I, O, U — treat Y as vowel when it's the only vowel sound in a syllable, but default to consonant for simplicity)
   - `calculatePersonality(fullName: string): number` — consonants only
   - `calculatePersonalYear(dateOfBirth: Date): number` — current year cycle
   - `getInterpretation(type: string, number: number): string` — return brief interpretation text for each number (1-9 + 11, 22, 33)
   - Include a comprehensive interpretation database as a const object

2. **chinese-zodiac.ts** — Chinese astrology with proper Lunar New Year boundaries:
   - Include a lookup table of Lunar New Year dates from 1924-2044
   - `getChineseZodiac(dateOfBirth: Date): { animal: string, element: string, yinYang: string, description: string }`
   - Handle January/February birthdays correctly by checking against that year's Lunar New Year date
   - Include personality descriptions for all 12 animals
   - Include element cycle (Wood, Fire, Earth, Metal, Water) based on the heavenly stem

3. **western-astrology.ts** — Sun sign and basic astrology:
   - `getSunSign(dateOfBirth: Date): { sign: string, decan: number, element: string, modality: string, rulingPlanet: string, description: string }`
   - Handle cusp dates properly (use standard tropical zodiac boundaries)
   - `getMoonSign(dateOfBirth: Date, birthTime?: string): string | null` — approximate moon sign using simplified ephemeris (if birth time provided). It's OK to use a simplified calculation or lookup table rather than full ephemeris for v1.
   - `getRisingSign(dateOfBirth: Date, birthTime: string, latitude: number, longitude: number): string | null` — calculate ascendant if all data available
   - Include descriptions for each sign

4. **life-stages.ts** — Life stage classification:
   - `classifyLifeStage(age: number, selectedStage: string): LifeStageContext`
   - Return an object with: `stage`, `focusAreas: string[]`, `toneGuidance: string`, `topicsToEmphasize: string[]`, `topicsToDeemphasize: string[]`
   - Example: if stage is "Parent" → emphasize nurturing style, patience patterns, family dynamics; de-emphasize career ambition framing

5. **analysis-prompt.ts** — Claude API prompt builder:
   - `buildAnalysisPrompt(data: CosmicProfile): string` — takes all calculated data + life context and builds a structured prompt
   - The prompt should instruct Claude to:
     - Write a 800-1200 word unified reading
     - Find connecting threads across all systems
     - Identify reinforcing patterns and interesting tensions
     - Adapt framing to the person's life stage
     - Include 3-5 actionable "cosmic toolkit" items
     - Use warm, intelligent tone (not woo-woo, not clinical)
     - If the user provided a "what's on your mind" note, weave that context in naturally
   - Include the system prompt for the Claude API call

### Phase 2: API Route

6. **app/api/generate-reading/route.ts**:
   - POST endpoint that receives birth data + life context
   - Runs all calculations server-side
   - Calls Claude API (claude-sonnet-4-5-20250929) with the built prompt
   - Returns structured JSON: `{ numerology: {...}, westernAstro: {...}, chineseZodiac: {...}, combinedAnalysis: string, cosmicToolkit: string[] }`
   - Add basic input validation
   - Add error handling — if Claude API fails, still return calculated data with `combinedAnalysis: null`

### Phase 3: UI

7. **Landing Page (app/page.tsx)**:
   - Hero section: "Cosmic Blueprint" title with tagline "Your complete cosmic profile, unified."
   - Subtle animated background — dark indigo with floating constellation dots (use Framer Motion or CSS keyframes, keep it performant)
   - Multi-step input wizard:
     - Step 1: Name + Date of Birth + Time of Birth (optional with toggle) + Place of Birth
     - Step 2: Life stage selector (visual cards, not a dropdown) + optional "what's on your mind?" textarea
     - Step 3: Brief loading/transition animation ("Mapping your cosmic blueprint...")
   - Design: dark navy background (#0a0e27), gold accents (#d4a853), serif headings (Playfair Display from Google Fonts), Inter for body text

8. **Results Page (app/results/page.tsx)**:
   - Progressive reveal — show sections as data loads
   - Section layout:
     1. **Cosmic Snapshot** — hero card with 1-paragraph AI summary, sun sign glyph, life path number, Chinese animal icon
     2. **The Numbers** — grid of numerology cards (Life Path, Expression, Soul Urge, Personality, Personal Year) with number displayed large, brief interpretation below
     3. **Your Star Map** — Western astrology section with sun/moon/rising displayed as badges, key traits listed, basic natal chart visualization (SVG circle with planet positions plotted — doesn't need to be a full professional chart, just visually appealing)
     4. **Your Eastern Mirror** — Chinese zodiac card with animal illustration (use emoji or simple SVG), element, yin/yang badge, personality description
     5. **The Unified Reading** — the AI-generated combined analysis, styled as flowing prose with subtle pull-quotes for key insights
     6. **This Season For You** — current personal year + active transits = what's relevant now
     7. **Your Cosmic Toolkit** — 3-5 actionable cards with practical takeaways
   - Each section: card-based with subtle borders, slight glassmorphism effect, fade-in on scroll
   - Mobile-first responsive design
   - Share button that generates an OG-image-friendly summary card

### Design Details:
- Color palette: Navy #0a0e27, Gold #d4a853, Purple #6c5ce7, Teal #00b894, White #f5f5f5
- Cards: dark surface (#141832) with 1px border (#1e2249), border-radius 16px
- Numbers/signs displayed with large decorative typography
- Smooth scroll between sections
- Loading states: skeleton cards with subtle shimmer animation

### Key Technical Decisions:
- Use server actions or API routes for the Claude call — don't expose the API key client-side
- All numerology/zodiac calculations can run client-side OR server-side (they're pure math)
- Use URL search params to pass data between input and results pages (or use a server action that redirects)
- For the natal chart SVG: a simple circle with 12 house divisions and colored dots for planet positions is sufficient for v1. Don't over-engineer this.
- Use `next/font` for font loading optimization

Start with Phase 1 and write comprehensive, well-typed TypeScript. Include JSDoc comments on the main exported functions. Let me know when Phase 1 is complete before moving to Phase 2.
```

---

## Environment Variables Needed

```env
ANTHROPIC_API_KEY=your_key_here
```

## Quick Start After Build

```bash
npx create-next-app@latest cosmic-blueprint --typescript --tailwind --app
cd cosmic-blueprint
# Place claude.md in root
# Add .env.local with ANTHROPIC_API_KEY
# Start building with the prompt above
```
