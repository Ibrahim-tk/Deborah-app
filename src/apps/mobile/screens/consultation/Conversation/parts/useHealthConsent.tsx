/**
 * First message after sign-up: our consent sheet asks for health-data consent (with the data-protection
 * promise), then the held health basics are saved and Deborah answers directly — no consent question in chat.
 * OPEN: "Not now" keeps the answers held; Deborah then asks for consent in chat as before.
 */
import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '@shared/store';
import { hasPendingHealthBasics, saveHealthBasics } from '@mobile/hooks/healthBasics';
import { ConsentSheet } from './ConsentSheet';

export function useHealthConsent() {
  const [open, setOpen] = useState(false);
  const resolve = useRef<(agreed: boolean) => void>(undefined);

  const ask = useCallback(async () => {
    if (!hasPendingHealthBasics()) return;
    const s = useAppStore.getState();
    if (!s.healthConsentAt) {
      setOpen(true);
      const agreed = await new Promise<boolean>((r) => { resolve.current = r; });
      setOpen(false);
      if (!agreed) return;
      s.acceptHealthConsent();
    }
    saveHealthBasics();
  }, []);

  const sheet = open ? <ConsentSheet onAgree={() => resolve.current?.(true)} onDecline={() => resolve.current?.(false)} /> : null;
  return { ask, sheet };
}
