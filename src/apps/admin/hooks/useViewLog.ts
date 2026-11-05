/** Writes one "Viewed …" audit entry when a record drawer opens (stories 3.1, 4.1, 10.1). Guarded against
 *  React's double-run in development so each open logs once. */
import { useEffect, useRef } from 'react';
import { useAdminStore } from '@shared/admin';

export function useViewLog(key: string | undefined, text: string) {
  const logged = useRef<string | null>(null);
  useEffect(() => {
    if (!key || logged.current === key) return;
    logged.current = key;
    useAdminStore.getState().log(text);
  }, [key, text]);
}
