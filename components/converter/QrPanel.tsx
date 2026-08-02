'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { encodeQr } from '@/lib/qr/qr';

export interface QrPanelProps {
  url: string;
}

/**
 * The link as a QR code, for getting it onto a phone from a desktop.
 *
 * Rendered as inline SVG rather than an image: it is crisp at any size, costs
 * no request, and needs no canvas. One `<rect>` per dark module is more
 * elements than a merged path, but a version-4 symbol is a few hundred of them
 * and the browser does not notice.
 *
 * **Fixed black on white, in both themes.** Inverting for dark mode would look
 * tidier and scan worse: plenty of camera apps will not read a light-on-dark
 * symbol, and a QR that sometimes fails is worse than one that never matches
 * the surrounding palette. The white plate doubles as the quiet zone the
 * specification requires.
 */
export function QrPanel({ url }: QrPanelProps) {
  const t = useTranslations('share');
  const qr = useMemo(() => (url ? encodeQr(url) : null), [url]);

  if (!qr) return null;

  const QUIET = 4;
  const extent = qr.size + QUIET * 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox={`0 0 ${extent} ${extent}`}
        className="size-24 rounded-md bg-white"
        role="img"
        aria-label={t('qrLabel')}
        shapeRendering="crispEdges"
      >
        {qr.modules.map((row, y) =>
          row.map((isDark, x) =>
            isDark ? (
              <rect
                key={`${y}-${x}`}
                x={x + QUIET}
                y={y + QUIET}
                width={1}
                height={1}
                fill="#000"
              />
            ) : null,
          ),
        )}
      </svg>
      <p className="text-fg-muted max-w-full truncate text-xs" title={url}>
        {url}
      </p>
    </div>
  );
}
