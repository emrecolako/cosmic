import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const locales = [
  ['en', 'en-GB'],
  ['tr', 'tr-TR'],
  ['es', 'es-ES'],
  ['fr', 'fr-FR'],
  ['de', 'de-DE'],
  ['pt', 'pt-BR'],
  ['it', 'it-IT'],
];

await fs.mkdir('artifacts/i18n-screenshots', { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const [slug, locale] of locales) {
    const context = await browser.newContext({
      locale,
      viewport: { width: 1280, height: 1400 },
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
    const lang = await page.locator('html').getAttribute('lang');
    if (lang !== slug) throw new Error(`${locale}: expected html lang ${slug}, got ${lang}`);
    await page.screenshot({ path: `artifacts/i18n-screenshots/${slug}.png`, fullPage: true });
    await context.close();
  }
} finally {
  await browser.close();
}
