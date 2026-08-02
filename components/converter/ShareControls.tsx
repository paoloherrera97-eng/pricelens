'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';

import { IconButton } from '@/components/ui';

import { QrPanel } from './QrPanel';

export interface ShareControlsProps {
  /** The absolute link. Empty until the origin is known, which disables sharing. */
  url: string;
  /** Used as the share sheet's title. */
  title: string;
  className?: string;
}

/** How long the "copied" confirmation stays up. */
const CONFIRMATION_MS = 2000;

/** Neither capability changes during a session, so nothing needs to notify. */
const subscribeNever = () => () => {};

const hasWebShare = () => typeof navigator.share === 'function';

/**
 * No touch input of any kind — the honest test for "this is a desktop and the
 * phone is the thing you want the link on". Capability, not a width breakpoint:
 * a phone in landscape is not a desktop. Guarded because `matchMedia` is absent
 * in some embedded webviews and in jsdom.
 */
const isDesktopDevice = () =>
  typeof window.matchMedia === 'function' && !window.matchMedia('(any-pointer: coarse)').matches;

/**
 * Share, with the fallbacks the platform actually needs.
 *
 * Three behaviours, chosen by capability rather than by user agent:
 *
 * - **Web Share**, where the browser has it — the native sheet is the one place
 *   the user's own apps live, and nothing we build competes with it.
 * - **Copy to clipboard** everywhere else, with a visible confirmation. Also the
 *   destination when a share sheet is dismissed with an error rather than a
 *   cancellation.
 * - **A QR code** on devices with no touch input at all, which is the honest
 *   test for "this is a desktop and the phone is the thing you want the link
 *   on". It is capability detection, not a width breakpoint: a phone in
 *   landscape is not a desktop.
 */
export function ShareControls({ url, title, className }: ShareControlsProps) {
  const t = useTranslations('share');
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  // Both are browser facts with no server answer, so they are read through the
  // store API rather than assigned in an effect: the server snapshot is `false`
  // and the real value arrives with hydration.
  const canWebShare = useSyncExternalStore(subscribeNever, hasWebShare, () => false);
  const isDesktop = useSyncExternalStore(subscribeNever, isDesktopDevice, () => false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), CONFIRMATION_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard access can be refused outright — an insecure origin, or a
      // permission policy. Showing the QR at least puts the link on screen in a
      // form the user can act on.
      setShowQr(true);
    }
  }, [url]);

  const handleShare = useCallback(async () => {
    if (!url) return;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // Dismissing the sheet is a decision, not a failure: falling back to a
        // clipboard write would hand them a link they just declined to send.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    await copy();
  }, [copy, title, url]);

  return (
    <div className={className}>
      <div className="flex items-center justify-center gap-0.5">
        <IconButton
          label={canWebShare ? t('share') : t('copy')}
          variant="ghost"
          disabled={!url}
          onClick={() => void handleShare()}
        >
          <svg className="size-2.5" viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
            <path
              d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"
              stroke="currentColor"
              strokeLinecap="round"
            />
          </svg>
        </IconButton>

        {isDesktop && (
          <IconButton
            label={t('qr')}
            variant="ghost"
            aria-pressed={showQr}
            aria-expanded={showQr}
            disabled={!url}
            onClick={() => setShowQr((open) => !open)}
          >
            <svg className="size-2.5" viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
              <path
                d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"
                stroke="currentColor"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>
        )}
      </div>

      {/* Polite and always mounted: a live region created at the same moment as
          its text is frequently not announced at all. */}
      <p role="status" aria-live="polite" className="text-success-600 min-h-3 text-center text-xs">
        {copied ? t('copied') : ''}
      </p>

      {showQr && <QrPanel url={url} />}
    </div>
  );
}
