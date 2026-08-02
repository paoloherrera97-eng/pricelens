import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names, with later Tailwind utilities winning over earlier ones.
 *
 * The `twMerge` half is not cosmetic. Tailwind emits utilities in a fixed
 * stylesheet order, so `class="p-2 p-4"` does not reliably resolve to `p-4` —
 * whichever rule appears later in the CSS wins, regardless of the order written
 * in the attribute. For a component library where callers pass `className` to
 * override a variant's defaults, that makes overrides silently unpredictable.
 * `twMerge` resolves conflicts by removing the losing utility outright.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
