'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils/cn';

export interface SelectOption {
  value: string;
  /** Primary line, e.g. the currency code. */
  label: string;
  /** Secondary line, e.g. the currency name. */
  description?: string;
  /** Trailing detail, e.g. the symbol. */
  meta?: string;
  /** Extra search terms — country names, so "Japón" finds JPY. */
  keywords?: string[];
}

export interface SelectProps {
  label: string;
  isLabelHidden?: boolean;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  /** Placeholder for the search field. */
  searchLabel: string;
  /** Shown when the filter matches nothing. */
  noResultsLabel: string;
  className?: string;
  disabled?: boolean;
}

function matches(option: SelectOption, query: string): boolean {
  if (!query) return true;
  // Fold accents so "Japon" finds "Japón" — a traveler typing one-handed on a
  // phone keyboard should not have to reach for the accent key.
  const normalise = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const needle = normalise(query);
  return [option.label, option.description ?? '', ...(option.keywords ?? [])].some((field) =>
    normalise(field).includes(needle),
  );
}

/**
 * A searchable single-select.
 *
 * Implements the combobox-with-listbox pattern: the search field owns
 * `role="combobox"`, the list owns `role="listbox"`, and the active option is
 * pointed at with `aria-activedescendant` so focus never leaves the input and
 * typing is never interrupted.
 *
 * On phones the panel opens as a bottom sheet rather than a dropdown, which puts
 * the options inside the thumb's reach instead of at the top of the screen.
 */
export function Select({
  label,
  isLabelHidden = false,
  value,
  options,
  onChange,
  searchLabel,
  noResultsLabel,
  className,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rawActiveIndex, setActiveIndex] = useState(0);

  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filtered = useMemo(
    () => options.filter((option) => matches(option, query)),
    [options, query],
  );

  const close = useCallback(({ restoreFocus = true }: { restoreFocus?: boolean } = {}) => {
    setIsOpen(false);
    setQuery('');
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const commit = useCallback(
    (option: SelectOption) => {
      onChange(option.value);
      close();
    },
    [close, onChange],
  );

  /**
   * Filtering can shrink the list out from under the active index. Clamping
   * during render rather than syncing in an effect avoids a second render pass
   * and keeps the value always consistent with the list being shown.
   */
  const activeIndex = rawActiveIndex >= filtered.length ? 0 : rawActiveIndex;

  const open = useCallback(() => {
    // Start on the current selection, so arrowing begins where the user already
    // is rather than at the top of 156 currencies. The query is empty on open,
    // so `options` and `filtered` are the same list here.
    const index = options.findIndex((option) => option.value === value);
    setActiveIndex(index >= 0 ? index : 0);
    setIsOpen(true);
  }, [options, value]);

  // Moving focus is a DOM effect, not state synchronisation.
  useEffect(() => {
    if (isOpen) searchRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close({ restoreFocus: false });
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen, close]);

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((i) => (filtered.length ? (i + 1) % filtered.length : 0));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(Math.max(filtered.length - 1, 0));
        break;
      case 'Enter': {
        event.preventDefault();
        const option = filtered[activeIndex];
        if (option) commit(option);
        break;
      }
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        // Tab must move on, not be trapped — but the panel should not linger.
        close({ restoreFocus: false });
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <span
        id={`${baseId}-label`}
        className={cn(
          'mb-0.5 block text-sm font-medium text-neutral-500',
          isLabelHidden && 'sr-only',
        )}
      >
        {label}
      </span>

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-labelledby={`${baseId}-label ${baseId}-trigger`}
        id={`${baseId}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? close({ restoreFocus: false }) : open())}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            open();
          }
        }}
        className={cn(
          'min-h-touch ring-outline flex w-full items-center justify-between gap-1 rounded-md bg-neutral-100 px-2 ring-1',
          'duration-fast text-left transition-colors ease-out',
          'hover:bg-neutral-200 disabled:pointer-events-none disabled:opacity-40',
        )}
      >
        <span className="flex min-w-0 items-baseline gap-1">
          <span className="font-medium text-neutral-900">{selected?.label ?? value}</span>
          {selected?.description && (
            <span className="truncate text-sm text-neutral-500">{selected.description}</span>
          )}
        </span>
        <ChevronIcon isOpen={isOpen} />
      </button>

      {isOpen && (
        <>
          {/* Dims the page behind the sheet on phones only; on larger screens the
              panel is a plain dropdown and needs no scrim. */}
          <div className="fixed inset-0 z-10 bg-neutral-900/20 sm:hidden" aria-hidden="true" />

          <div
            className={cn(
              'z-20 flex flex-col gap-1 bg-white p-1 shadow-lg',
              // Phone: bottom sheet, inside thumb reach.
              'fixed inset-x-0 bottom-0 max-h-[70dvh] rounded-t-xl pb-[max(0.5rem,env(safe-area-inset-bottom))]',
              // Tablet and up: anchored dropdown.
              'sm:absolute sm:inset-x-auto sm:bottom-auto sm:mt-0.5 sm:w-full sm:rounded-xl sm:pb-1',
            )}
          >
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-label={searchLabel}
              aria-activedescendant={
                filtered.length ? `${baseId}-option-${activeIndex}` : undefined
              }
              placeholder={searchLabel}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onSearchKeyDown}
              className={cn(
                'min-h-touch ring-outline w-full rounded-md bg-neutral-100 px-2 text-base text-neutral-900 ring-1',
                'placeholder:text-neutral-500',
                'focus-visible:outline-primary-500 outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
              )}
            />

            {filtered.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-neutral-500">{noResultsLabel}</p>
            ) : (
              <ul
                ref={listRef}
                id={listboxId}
                role="listbox"
                aria-label={label}
                className="overflow-y-auto overscroll-contain"
              >
                {filtered.map((option, index) => {
                  const isActive = index === activeIndex;
                  const isSelected = option.value === value;
                  return (
                    <li
                      key={option.value}
                      id={`${baseId}-option-${index}`}
                      data-index={index}
                      role="option"
                      aria-selected={isSelected}
                      onPointerDown={(event) => {
                        // Keep focus in the search field so the panel does not
                        // close before the click resolves.
                        event.preventDefault();
                        commit(option);
                      }}
                      onPointerEnter={() => setActiveIndex(index)}
                      className={cn(
                        'min-h-touch flex cursor-pointer items-center justify-between gap-1 rounded-md px-2',
                        isActive && 'bg-primary-50',
                        isSelected && 'font-medium',
                      )}
                    >
                      <span className="flex min-w-0 items-baseline gap-1">
                        <span className="text-neutral-900">{option.label}</span>
                        {option.description && (
                          <span className="truncate text-sm text-neutral-500">
                            {option.description}
                          </span>
                        )}
                      </span>
                      {option.meta && (
                        <span className="shrink-0 text-sm text-neutral-500">{option.meta}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={cn(
        // neutral-400 would be 2.34:1 here — too low for a meaningful UI graphic.
        'duration-base size-2 shrink-0 text-neutral-500 transition-transform ease-out',
        isOpen && 'rotate-180',
      )}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
