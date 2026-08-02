'use client';

import { useEffect, useState } from 'react';

/**
 * Whether the browser believes it has a connection.
 *
 * Starts optimistic (`true`) so server and client markup agree; a device that is
 * genuinely offline corrects itself on mount, one frame later.
 *
 * `navigator.onLine` only reports whether a network interface exists — hotel
 * Wi-Fi with a captive portal reports `true`. It is therefore used only to
 * choose the wording of a failure the app has *already* observed, never to
 * predict whether a request will succeed.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    update();

    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return isOnline;
}
