import { NextResponse } from 'next/server';

import { APP_CONFIG } from '@/config';
import { RatesUnavailableError, resolveRates } from '@/services/rates';

/**
 * Rate table endpoint.
 *
 * A server-side proxy rather than a direct client fetch (ADR-002): it gives us
 * Next's Data Cache — one upstream call per hour per deployment regardless of
 * user count — avoids CORS, and keeps the provider swappable without shipping
 * its URL to the browser.
 *
 * The base currency is fixed by config rather than taken from the query string:
 * every pair is derived client-side from this one table (ADR-001), so a
 * per-request base would multiply upstream calls for no benefit.
 */
export async function GET() {
  try {
    const snapshot = await resolveRates(APP_CONFIG.baseCurrency);

    return NextResponse.json(snapshot, {
      headers: {
        // The service worker keeps its own copy for offline use; this lets a
        // browser reuse the response briefly without going stale.
        'Cache-Control': `public, max-age=60, stale-while-revalidate=${APP_CONFIG.ratesRevalidateSeconds}`,
      },
    });
  } catch (error) {
    if (error instanceof RatesUnavailableError) {
      // Log the provider-by-provider detail server-side; the client gets a
      // plain statement, never a stack trace or a provider URL.
      console.error('[rates] every provider failed', error.attempts);
      return NextResponse.json({ error: 'rates_unavailable' }, { status: 503 });
    }

    console.error('[rates] unexpected failure', error);
    return NextResponse.json({ error: 'rates_unavailable' }, { status: 503 });
  }
}
