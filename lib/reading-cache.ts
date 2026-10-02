import { createHmac, randomBytes } from 'node:crypto';

/** Process-local keyed hashes prevent raw birth details being retained as keys. */
const secret = randomBytes(32);
const TTL = 24 * 60 * 60 * 1000;
const entries = new Map<string, { text: string; expires: number; timer: ReturnType<typeof setTimeout> }>();
export function readingCacheKey(body: Record<string, unknown>): string {
  return createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
}
export function cachedReading(key: string): string | undefined {
  const entry = entries.get(key);
  if (!entry) return;
  if (Date.now() >= entry.expires) { clearTimeout(entry.timer); entries.delete(key); return; }
  return entry.text;
}
export function cacheReading(key: string, text: string): void {
  const previous = entries.get(key);
  if (previous) clearTimeout(previous.timer);
  if (entries.size >= 500 && !previous) {
    const oldest = entries.keys().next().value;
    if (oldest) { clearTimeout(entries.get(oldest)!.timer); entries.delete(oldest); }
  }
  const timer = setTimeout(() => entries.delete(key), TTL);
  timer.unref();
  entries.set(key, { text, expires: Date.now() + TTL, timer });
}
