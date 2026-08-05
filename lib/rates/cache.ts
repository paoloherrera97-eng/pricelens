/**
 * The last rate table the traveler genuinely received — the data, with no React
 * and no storage in sight.
 *
 * A provider outage should cost freshness, not the app. A table from this
 * morning converts a restaurant bill perfectly well; a "try again" screen with
 * no controls converts nothing, and it arrives precisely when the traveler is
 * abroad on a connection that is already failing them.
 *
 * `degraded` on the snapshot has meant "this is fallback data rather than a
 * live fetch" since the provider contract was written (ADR-002). Nothing set it
 * until now. Restoring from here is what it was for, and the UI must say so —
 * presenting stale data as live is the one thing this product must never do
 * (PROJECT_BIBLE, Value #4).
 */

import { isCurrencyCode } from '@/config';
import type { RateSnapshot } from '@/types';

/**
 * Validates a stored snapshot.
 *
 * Anything written by an older deploy, hand-edited, or truncated mid-write is
 * rejected outright rather than partially trusted: a table missing half its
 * currencies would convert some pairs and silently fail others, and the failure
 * would look like a product bug rather than corrupt storage.
 */
export function parseCachedSnapshot(raw: string): RateSnapshot | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;
  const candidate = parsed as Partial<RateSnapshot>;

  if (typeof candidate.base !== 'string' || !isCurrencyCode(candidate.base)) return null;
  if (typeof candidate.fetchedAt !== 'string') return null;
  if (Number.isNaN(new Date(candidate.fetchedAt).getTime())) return null;
  if (typeof candidate.source !== 'string') return null;

  const { rates } = candidate;
  if (typeof rates !== 'object' || rates === null) return null;

  const entries = Object.entries(rates);
  if (entries.length === 0) return null;
  // A single bad rate poisons every pair that triangulates through it, so one
  // is enough to discard the table.
  for (const [code, rate] of entries) {
    if (!isCurrencyCode(code)) return null;
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) return null;
  }

  return {
    ...(candidate as RateSnapshot),
    // Whatever was stored, reading it back means this is not a live fetch.
    degraded: true,
  };
}

/**
 * The form a snapshot is stored in.
 *
 * Written as it arrived, `degraded: false` and all: the flag describes *how the
 * app got the table right now*, not a property of the data, and it is set on
 * the way out rather than on the way in.
 */
export function serialiseSnapshot(snapshot: RateSnapshot): string {
  return JSON.stringify(snapshot);
}
