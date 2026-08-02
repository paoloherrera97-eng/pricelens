import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * `tailwind-merge` configured for this project's custom tokens.
 *
 * The `extend` block is not optional polish — without it the design system is
 * quietly broken. tailwind-merge decides which class group a utility belongs to
 * by pattern: `text-lg` is a font size because `lg` is a t-shirt size, while
 * anything unrecognised after `text-` falls through to the *colour* group.
 *
 * Our display sizes are named `text-display` and `text-display-sm`, which match
 * no size pattern. They were therefore treated as colours and silently dropped
 * whenever a real colour like `text-fg` appeared alongside them — rendering the
 * conversion result at 16px instead of 48px. Declaring them here restores the
 * distinction. Any future custom `--text-*` token must be added too.
 *
 * `text-fit` and `text-fit-lg` are the same hazard: they are font sizes that
 * look like colours. `text-fit` sits next to `text-fg` on the result value, so
 * leaving them out would drop the sizing utility exactly as before.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'display-sm', 'fit', 'fit-lg'] }],
    },
  },
});

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
