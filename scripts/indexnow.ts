/**
 * Submits changed library URLs to IndexNow (Bing, Yandex, Seznam, Naver and
 * other participating engines share submissions).
 *
 *   npx tsx scripts/indexnow.ts                  # dry run: list URLs updated in the last 3 days
 *   npx tsx scripts/indexnow.ts --since 2026-10-20
 *   npx tsx scripts/indexnow.ts --all            # every indexable page plus the sitemaps
 *   npx tsx scripts/indexnow.ts --submit         # actually POST (only do this against production)
 *
 * Only pages that are indexable in the deployed build are submitted, so run
 * it with the same LIBRARY_INDEX_UNREVIEWED value as the production build.
 * The key file is public/ad63d03066454afead39a2d10ecf1686.txt.
 */
import { ALL_ENTRIES } from "../lib/library/registry";
import { isIndexable, loadContent } from "../lib/library/content";
import { SITEMAP_IDS } from "../lib/library/sitemaps";
import { SITE_URL } from "../lib/site";

const KEY = "ad63d03066454afead39a2d10ecf1686";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS = 10_000;

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const option = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const since = option("--since") ?? new Date(Date.now() - 3 * 86_400_000).toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) throw new Error(`--since must be YYYY-MM-DD, got ${since}`);

const pages = ALL_ENTRIES
  .map((entry) => ({ entry, content: loadContent(entry) }))
  .filter(({ content }) => isIndexable(content))
  .filter(({ content }) => flag("--all") || content.updatedAt >= since);

const urls = [
  ...pages.map(({ entry }) => `${SITE_URL}${entry.path}`),
  ...(pages.length ? [`${SITE_URL}/sitemap.xml`, ...SITEMAP_IDS.map((id) => `${SITE_URL}/sitemap/${id}.xml`), `${SITE_URL}/llms-full.txt`] : []),
].slice(0, MAX_URLS);

async function main() {
  const indexable = ALL_ENTRIES.filter((entry) => isIndexable(loadContent(entry))).length;
  console.log(`${indexable} of ${ALL_ENTRIES.length} library pages are indexable in this build; ${pages.length} ${flag("--all") ? "selected" : `updated since ${since}`}.`);
  if (!urls.length) {
    console.log("Nothing to submit.");
    return;
  }
  for (const url of urls) console.log(`  ${url}`);
  if (!flag("--submit")) {
    console.log("Dry run. Pass --submit to send these URLs to IndexNow.");
    return;
  }
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(SITE_URL).host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList: urls }),
  });
  // 200 and 202 both mean accepted; 422 usually means the key file is not reachable yet.
  console.log(`IndexNow responded ${response.status} ${response.statusText}`);
  if (response.status !== 200 && response.status !== 202) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
