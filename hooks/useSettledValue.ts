'use client';

import { useEffect, useState } from 'react';

/**
 * The value, once it has stopped changing.
 *
 * For announcing a result that updates on every keystroke. A screen reader
 * queues each change to a live region and reads them in turn, so an amount
 * typed as five digits produces five announcements — and because the reader
 * interrupts itself, the user hears five fragments instead of one answer.
 *
 * Returning the settled value means the region changes once, when the typing
 * stops, which is the only moment the number is worth saying out loud.
 *
 * Visual state must never be routed through this: the screen has to keep up
 * with the keystrokes.
 */
export function useSettledValue<T>(value: T, delayMs: number): T {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return settled;
}
