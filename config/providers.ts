/**
 * Exchange-rate provider registry.
 *
 * Adding or replacing a provider is an entry here plus a module implementing
 * `RateProvider` — no business logic changes, because nothing outside
 * `services/rates` knows which provider produced a table (ADR-002).
 */

export type ProviderId = 'exchangerate-api';

export interface ProviderConfig {
  readonly id: ProviderId;
  /** Shown to the user in the rate-attribution line. */
  readonly label: string;
  /** `live` hits the network; `fallback` is always available. */
  readonly kind: 'live' | 'fallback';
  /** Absent for providers that need no network. */
  readonly endpoint?: string;
  /**
   * Whether the provider needs a secret. Every V1 provider is keyless, which is
   * why the app deploys with zero environment variables. A provider that needs
   * one must be called server-side only.
   */
  readonly requiresApiKey: boolean;
  /** Approximate number of supported currencies, for documentation purposes. */
  readonly coverage: number;
}

export const RATE_PROVIDERS: Record<ProviderId, ProviderConfig> = {
  'exchangerate-api': {
    id: 'exchangerate-api',
    label: 'ExchangeRate-API',
    kind: 'live',
    endpoint: 'https://open.er-api.com/v6/latest',
    requiresApiKey: false,
    coverage: 160,
  },
};

/**
 * Resolution order. The first provider to return a valid table wins.
 *
 * There is deliberately no bundled-snapshot provider at the end of this chain.
 * Shipping rates we invented would be indistinguishable, to a user, from rates
 * we fetched — and a confidently wrong price is the one failure this product
 * cannot have. Offline continuity comes from the service worker replaying the
 * last table the user genuinely received; when there is none, the UI says so
 * (ADR-013).
 */
export const PROVIDER_CHAIN: readonly ProviderId[] = ['exchangerate-api'];
