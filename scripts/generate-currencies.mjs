// Generates config/currencies.ts from ICU data (Node 22 ships full ICU).
// Spanish display names, correct minor-unit digits, and symbols all come from
// Intl rather than being hand-typed — hand-typed currency tables rot and lie.

import { writeFileSync } from 'node:fs';

const CODES = [
  'AED',
  'AFN',
  'ALL',
  'AMD',
  'ANG',
  'AOA',
  'ARS',
  'AUD',
  'AWG',
  'AZN',
  'BAM',
  'BBD',
  'BDT',
  'BGN',
  'BHD',
  'BIF',
  'BMD',
  'BND',
  'BOB',
  'BRL',
  'BSD',
  'BTN',
  'BWP',
  'BYN',
  'BZD',
  'CAD',
  'CDF',
  'CHF',
  'CLP',
  'CNY',
  'COP',
  'CRC',
  'CUP',
  'CVE',
  'CZK',
  'DJF',
  'DKK',
  'DOP',
  'DZD',
  'EGP',
  'ERN',
  'ETB',
  'EUR',
  'FJD',
  'FKP',
  'GBP',
  'GEL',
  'GHS',
  'GIP',
  'GMD',
  'GNF',
  'GTQ',
  'GYD',
  'HKD',
  'HNL',
  'HRK',
  'HTG',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'IQD',
  'IRR',
  'ISK',
  'JMD',
  'JOD',
  'JPY',
  'KES',
  'KGS',
  'KHR',
  'KMF',
  'KPW',
  'KRW',
  'KWD',
  'KYD',
  'KZT',
  'LAK',
  'LBP',
  'LKR',
  'LRD',
  'LSL',
  'LYD',
  'MAD',
  'MDL',
  'MGA',
  'MKD',
  'MMK',
  'MNT',
  'MOP',
  'MRU',
  'MUR',
  'MVR',
  'MWK',
  'MXN',
  'MYR',
  'MZN',
  'NAD',
  'NGN',
  'NIO',
  'NOK',
  'NPR',
  'NZD',
  'OMR',
  'PAB',
  'PEN',
  'PGK',
  'PHP',
  'PKR',
  'PLN',
  'PYG',
  'QAR',
  'RON',
  'RSD',
  'RUB',
  'RWF',
  'SAR',
  'SBD',
  'SCR',
  'SDG',
  'SEK',
  'SGD',
  'SHP',
  'SLE',
  'SOS',
  'SRD',
  'SSP',
  'STN',
  'SVC',
  'SYP',
  'SZL',
  'THB',
  'TJS',
  'TMT',
  'TND',
  'TOP',
  'TRY',
  'TTD',
  'TWD',
  'TZS',
  'UAH',
  'UGX',
  'USD',
  'UYU',
  'UZS',
  'VES',
  'VND',
  'VUV',
  'WST',
  'XAF',
  'XCD',
  'XOF',
  'XPF',
  'YER',
  'ZAR',
  'ZMW',
  'ZWG',
];

// Country/territory hints in Spanish, so a traveler can search "Japón" or
// "Tailandia" rather than needing to know the ISO code (PRD FR-2).
const REGIONS = {
  AED: 'Emiratos Árabes Unidos',
  AFN: 'Afganistán',
  ALL: 'Albania',
  AMD: 'Armenia',
  ANG: 'Caribe Neerlandés',
  AOA: 'Angola',
  ARS: 'Argentina',
  AUD: 'Australia',
  AWG: 'Aruba',
  AZN: 'Azerbaiyán',
  BAM: 'Bosnia y Herzegovina',
  BBD: 'Barbados',
  BDT: 'Bangladés',
  BGN: 'Bulgaria',
  BHD: 'Baréin',
  BIF: 'Burundi',
  BMD: 'Bermudas',
  BND: 'Brunéi',
  BOB: 'Bolivia',
  BRL: 'Brasil',
  BSD: 'Bahamas',
  BTN: 'Bután',
  BWP: 'Botsuana',
  BYN: 'Bielorrusia',
  BZD: 'Belice',
  CAD: 'Canadá',
  CDF: 'República Democrática del Congo',
  CHF: 'Suiza',
  CLP: 'Chile',
  CNY: 'China',
  COP: 'Colombia',
  CRC: 'Costa Rica',
  CUP: 'Cuba',
  CVE: 'Cabo Verde',
  CZK: 'Chequia',
  DJF: 'Yibuti',
  DKK: 'Dinamarca',
  DOP: 'República Dominicana',
  DZD: 'Argelia',
  EGP: 'Egipto',
  ERN: 'Eritrea',
  ETB: 'Etiopía',
  EUR: 'Zona euro',
  FJD: 'Fiyi',
  FKP: 'Islas Malvinas',
  GBP: 'Reino Unido',
  GEL: 'Georgia',
  GHS: 'Ghana',
  GIP: 'Gibraltar',
  GMD: 'Gambia',
  GNF: 'Guinea',
  GTQ: 'Guatemala',
  GYD: 'Guyana',
  HKD: 'Hong Kong',
  HNL: 'Honduras',
  HRK: 'Croacia',
  HTG: 'Haití',
  HUF: 'Hungría',
  IDR: 'Indonesia',
  ILS: 'Israel',
  INR: 'India',
  IQD: 'Irak',
  IRR: 'Irán',
  ISK: 'Islandia',
  JMD: 'Jamaica',
  JOD: 'Jordania',
  JPY: 'Japón',
  KES: 'Kenia',
  KGS: 'Kirguistán',
  KHR: 'Camboya',
  KMF: 'Comoras',
  KPW: 'Corea del Norte',
  KRW: 'Corea del Sur',
  KWD: 'Kuwait',
  KYD: 'Islas Caimán',
  KZT: 'Kazajistán',
  LAK: 'Laos',
  LBP: 'Líbano',
  LKR: 'Sri Lanka',
  LRD: 'Liberia',
  LSL: 'Lesoto',
  LYD: 'Libia',
  MAD: 'Marruecos',
  MDL: 'Moldavia',
  MGA: 'Madagascar',
  MKD: 'Macedonia del Norte',
  MMK: 'Birmania',
  MNT: 'Mongolia',
  MOP: 'Macao',
  MRU: 'Mauritania',
  MUR: 'Mauricio',
  MVR: 'Maldivas',
  MWK: 'Malaui',
  MXN: 'México',
  MYR: 'Malasia',
  MZN: 'Mozambique',
  NAD: 'Namibia',
  NGN: 'Nigeria',
  NIO: 'Nicaragua',
  NOK: 'Noruega',
  NPR: 'Nepal',
  NZD: 'Nueva Zelanda',
  OMR: 'Omán',
  PAB: 'Panamá',
  PEN: 'Perú',
  PGK: 'Papúa Nueva Guinea',
  PHP: 'Filipinas',
  PKR: 'Pakistán',
  PLN: 'Polonia',
  PYG: 'Paraguay',
  QAR: 'Catar',
  RON: 'Rumanía',
  RSD: 'Serbia',
  RUB: 'Rusia',
  RWF: 'Ruanda',
  SAR: 'Arabia Saudí',
  SBD: 'Islas Salomón',
  SCR: 'Seychelles',
  SDG: 'Sudán',
  SEK: 'Suecia',
  SGD: 'Singapur',
  SHP: 'Santa Elena',
  SLE: 'Sierra Leona',
  SOS: 'Somalia',
  SRD: 'Surinam',
  SSP: 'Sudán del Sur',
  STN: 'Santo Tomé y Príncipe',
  SVC: 'El Salvador',
  SYP: 'Siria',
  SZL: 'Esuatini',
  THB: 'Tailandia',
  TJS: 'Tayikistán',
  TMT: 'Turkmenistán',
  TND: 'Túnez',
  TOP: 'Tonga',
  TRY: 'Turquía',
  TTD: 'Trinidad y Tobago',
  TWD: 'Taiwán',
  TZS: 'Tanzania',
  UAH: 'Ucrania',
  UGX: 'Uganda',
  USD: 'Estados Unidos',
  UYU: 'Uruguay',
  UZS: 'Uzbekistán',
  VES: 'Venezuela',
  VND: 'Vietnam',
  VUV: 'Vanuatu',
  WST: 'Samoa',
  XAF: 'África Central',
  XCD: 'Caribe Oriental',
  XOF: 'África Occidental',
  XPF: 'Polinesia Francesa',
  YER: 'Yemen',
  ZAR: 'Sudáfrica',
  ZMW: 'Zambia',
  ZWG: 'Zimbabue',
};

const names = new Intl.DisplayNames(['es'], { type: 'currency' });

function symbolOf(code) {
  const parts = new Intl.NumberFormat('es', {
    style: 'currency',
    currency: code,
    currencyDisplay: 'narrowSymbol',
  }).formatToParts(0);
  return parts.find((p) => p.type === 'currency')?.value ?? code;
}

function digitsOf(code) {
  return new Intl.NumberFormat('en', { style: 'currency', currency: code }).resolvedOptions()
    .maximumFractionDigits;
}

const rows = CODES.map((code) => {
  const name = names.of(code);
  return {
    code,
    name: name === code ? code : name,
    symbol: symbolOf(code),
    digits: digitsOf(code),
    region: REGIONS[code] ?? '',
  };
});

const missing = rows.filter((r) => !r.region || r.name === r.code);
if (missing.length) {
  console.error('Incomplete metadata for:', missing.map((m) => m.code).join(', '));
  process.exit(1);
}

const HEADER = `/**
 * Currency metadata — the single source of truth for every currency in PriceLens.
 *
 * GENERATED by scripts/generate-currencies.mjs from ICU/CLDR data. Do not edit by
 * hand: run \`node scripts/generate-currencies.mjs\` and commit the result.
 * Hand-maintained currency tables drift from reality and get minor units wrong.
 *
 * \`digits\` is read from \`Intl.NumberFormat(...).resolvedOptions()\`, which means it
 * always agrees with how we actually render the value. Note this follows CLDR's
 * practical minor units rather than ISO 4217's nominal ones — e.g. CLDR treats ALL
 * and IQD as zero-decimal because they are not subdivided in practice. Agreeing with
 * the formatter is what matters: rounding and display can never disagree.
 *
 * See docs/ARCHITECTURE.md ADR-006.
 */

export interface CurrencyMeta {
  /** ISO 4217 alphabetic code. */
  readonly code: string;
  /** Display name in Spanish (CLDR). */
  readonly name: string;
  /** Narrow symbol, falling back to the code where CLDR has no symbol. */
  readonly symbol: string;
  /** Minor-unit digits used for rounding AND display. */
  readonly digits: number;
  /** Country or territory, so travelers can search "Jap\u00f3n" instead of "JPY". */
  readonly region: string;
}

export const CURRENCIES = [
`;

const FOOTER = `] as const satisfies readonly CurrencyMeta[];

/** Union of every supported code — gives compile-time checking at call sites. */
export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

const BY_CODE: ReadonlyMap<string, CurrencyMeta> = new Map(
  CURRENCIES.map((currency) => [currency.code, currency]),
);

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && BY_CODE.has(value);
}

/**
 * Look up a currency. Throws on an unknown code: a missing currency is a
 * programming error, and silently returning a default would produce a wrong
 * price — the one failure mode this product cannot have.
 */
export function getCurrency(code: CurrencyCode): CurrencyMeta {
  const currency = BY_CODE.get(code);
  if (!currency) {
    throw new Error(\`Unknown currency code: \${code}\`);
  }
  return currency;
}
`;

const body = rows
  .map(
    (r) =>
      `  { code: '${r.code}', name: '${r.name.replace(/'/g, "\\'")}', symbol: '${r.symbol.replace(/'/g, "\\'")}', digits: ${r.digits}, region: '${r.region.replace(/'/g, "\\'")}' },`,
  )
  .join('\n');

const outPath = new URL('../config/currencies.ts', import.meta.url);
writeFileSync(outPath, HEADER + body + '\n' + FOOTER);

console.log(`Wrote ${rows.length} currencies to config/currencies.ts`);
console.log('Run `pnpm format` afterwards to normalise the output.');
