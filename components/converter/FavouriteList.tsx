'use client';

import { useTranslations } from 'next-intl';

import { getCountry, getCurrency } from '@/config';
import type { Favourite } from '@/lib/favourites/favourites';
import { cn } from '@/lib/utils/cn';

import { Flag } from './Flag';

export interface FavouriteListProps {
  favourites: readonly Favourite[];
  /** The pair currently on screen, so it can be marked rather than re-picked. */
  current: Favourite;
  onSelect: (favourite: Favourite) => void;
  className?: string;
}

/**
 * Saved pairs, one tap away.
 *
 * A horizontal strip rather than a grid or a menu: it costs one line of height,
 * needs no disclosure, and puts the chips in the lower half of the screen where
 * a thumb already is. Renders nothing at all when there are no favourites —
 * an empty-state prompt would be teaching a feature at the exact moment the
 * user is trying to read a price.
 *
 * There is no delete affordance on the chips, and that is deliberate. A second
 * target inside each chip would either be too small to hit or too large to fit,
 * on the screen size that matters most. Tapping a chip makes it current, which
 * fills the star beside the selector — so removing is "tap it, unstar it",
 * using the control that already means exactly that.
 */
export function FavouriteList({ favourites, current, onSelect, className }: FavouriteListProps) {
  const t = useTranslations('favourites');

  if (favourites.length === 0) return null;

  return (
    <div className={className}>
      <p id="favourites-label" className="text-fg-muted mb-0.5 text-sm font-medium">
        {t('title')}
      </p>
      <ul
        aria-labelledby="favourites-label"
        // Scrolls rather than wraps, so the row's height never changes as
        // favourites are added — the result below it must not move.
        className="-mx-0.5 flex [scrollbar-width:none] gap-1 overflow-x-auto px-0.5 pb-0.5 [&::-webkit-scrollbar]:hidden"
      >
        {favourites.map((favourite) => {
          const country = getCountry(favourite.country);
          // `parseFavourites` drops unresolvable entries, so this is a guard
          // against a country being retired between renders, not a real state.
          if (!country) return null;

          const from = getCurrency(country.currency);
          const to = getCurrency(favourite.to);
          const isCurrent =
            country.currency === getCountry(current.country)?.currency &&
            favourite.to === current.to;

          return (
            <li key={`${favourite.country}-${favourite.to}`}>
              <button
                type="button"
                onClick={() => onSelect(favourite)}
                // The pair is the label. A screen reader hears "Tailandia, THB
                // a EUR" rather than three unlabelled codes.
                aria-label={t('select', { country: country.name, from: from.code, to: to.code })}
                aria-current={isCurrent ? 'true' : undefined}
                className={cn(
                  'min-h-touch ring-outline-soft flex items-center gap-0.5 rounded-full px-1.5 ring-1',
                  'text-sm whitespace-nowrap',
                  'duration-fast transition-colors ease-out',
                  'active:scale-[0.97] motion-reduce:active:scale-100',
                  isCurrent
                    ? 'bg-tint text-fg font-medium'
                    : 'bg-sunken text-fg-muted hover:bg-hover',
                )}
              >
                <Flag emoji={country.flag} code={country.code} />
                <span className="tabular">
                  {from.code} → {to.code}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
