# Direction B — Personal Dossier

Approved Paper reference: https://app.paper.design/file/01M5M4XV79S683DCX5V4097WSR/p-1-0

The landing page follows the dark sample-first direction. Shared form, report, information-page and navigation styles use the same monochrome system.

- Backgrounds: #121212, #F7F7F7 and #EDEDED. Text: #575657 on light surfaces.
- Type: bundled Romana Regular; Arial body; Andale Mono metadata with system fallbacks.
- Heading scale: 40/40, 30/34 and 23/26px. Body: 14/20px; long-form pages: 16/26px.
- Original AI-generated transparent artwork is in public/artwork. No Co–Star artwork is included.
- Marketing and information copy is English and marked accordingly. The existing seven-language wizard, calculations, reports and payment copy remain localized.
- Pricing is configuration-driven. Checkout, interpretation and input storage behavior are preserved.

## Local verification

Run npm run build for calculations, localization, attribution, TypeScript and production compilation. Run npm run dev for a local preview.

The redesign was checked at desktop and 390px mobile widths. Landing, all five wizard steps, sample, pricing, method, privacy and contact were inspected. A fictional input reached the calculated report; local OpenRouter returned 401, correctly exposing the existing retry state. A valid local provider credential is needed to test successful live generation. No live payment was made.
