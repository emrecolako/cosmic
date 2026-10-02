# Cosmic Blueprint

[Cosmic Blueprint](https://unifiedreading.com/) is a personal reflection website that brings Pythagorean numerology, Western zodiac signs, and the Chinese zodiac into one reading. Visitors choose the life stages that matter to them, then receive a combined interpretation with practical prompts.

- [Try the live site](https://unifiedreading.com/)
- [Read a free fictional sample](https://unifiedreading.com/sample)
- [See the method and limitations](https://unifiedreading.com/about)
- [Check current pricing](https://unifiedreading.com/pricing)
- [Read the privacy explanation](https://unifiedreading.com/privacy)

The site calculates numerology and zodiac values from the details a visitor enters. Birth time and place are optional; without enough data, Moon and rising signs are omitted. The chart is an approximate sign-level diagram. Houses, planetary aspects, and current transits are not calculated. The interpretation is for reflection, not scientific assessment or prediction.

## Development

This is a Next.js App Router application. From the project directory:

```sh
npm ci
npm run dev
```

Run `npm run build` to execute the calculation checks, translation checks, TypeScript validation, and production build. AI interpretations use OpenRouter; checkout uses Stripe when its server-side configuration is present. Keep local credentials out of Git.

For machine-readable product guidance, see [llms.txt](https://unifiedreading.com/llms.txt) and [agents.md](https://unifiedreading.com/agents.md). Personal birth details should be entered on the website, not in public issues.
