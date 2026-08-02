import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { IntlMessageFormat } from 'intl-messageformat';
import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, LOCALES, LOCALE_FORMATTING } from '@/config';

type MessageTree = { [key: string]: string | MessageTree };

function load(locale: string): MessageTree {
  const path = join(process.cwd(), 'messages', `${locale}.json`);
  return JSON.parse(readFileSync(path, 'utf8')) as MessageTree;
}

function flatten(tree: MessageTree, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      out.set(path, value);
    } else {
      for (const [k, v] of flatten(value, path)) out.set(k, v);
    }
  }
  return out;
}

const catalogues = new Map(LOCALES.map((locale) => [locale, flatten(load(locale))]));

describe('message catalogues', () => {
  it('has a catalogue for every configured locale', () => {
    for (const locale of LOCALES) {
      expect(catalogues.get(locale)?.size, locale).toBeGreaterThan(0);
    }
  });

  it('has no empty or placeholder strings', () => {
    for (const [locale, messages] of catalogues) {
      for (const [key, value] of messages) {
        expect(value.trim().length, `${locale}:${key}`).toBeGreaterThan(0);
        expect(value, `${locale}:${key}`).not.toMatch(/^(TODO|FIXME|TBD)/i);
      }
    }
  });

  /**
   * The check that makes adding a locale safe: every catalogue must define
   * exactly the same keys as the default, so a translation can never silently
   * fall back to a raw key in the UI.
   */
  it('keeps every locale in sync with the default locale', () => {
    const reference = catalogues.get(DEFAULT_LOCALE);
    expect(reference).toBeDefined();
    const referenceKeys = [...reference!.keys()].sort();

    for (const [locale, messages] of catalogues) {
      if (locale === DEFAULT_LOCALE) continue;
      expect([...messages.keys()].sort(), `${locale} key set`).toEqual(referenceKeys);
    }
  });

  /**
   * ICU syntax errors only surface when a message is rendered, which in
   * practice means in front of a user. Compiling every message here moves that
   * failure to the test suite.
   */
  it('compiles every message as valid ICU for its locale', () => {
    for (const [locale, messages] of catalogues) {
      const tag = LOCALE_FORMATTING[locale];
      for (const [key, value] of messages) {
        expect(() => new IntlMessageFormat(value, tag), `${locale}:${key}`).not.toThrow();
      }
    }
  });

  it('formats the plural messages correctly in Spanish', () => {
    const messages = catalogues.get('es')!;
    const minutes = new IntlMessageFormat(messages.get('rates.minutesAgo')!, 'es-ES');

    expect(minutes.format({ count: 1 })).toBe('hace 1 minuto');
    expect(minutes.format({ count: 5 })).toBe('hace 5 minutos');
  });
});
