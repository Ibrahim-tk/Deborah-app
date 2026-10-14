/**
 * First message after sign-up: Deborah asks for health-data consent (with the data-protection promise and
 * the disclaimer) as an inline widget in the thread, not a bottom sheet (design direction 2026-10-14);
 * then the held health basics are saved and Deborah answers directly.
 * OPEN: "Not now" keeps the answers held; Deborah then asks for consent in chat as before.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '@shared/store';
import { hasPendingHealthBasics, saveHealthBasics } from '@mobile/hooks/healthBasics';
import { MessageBubble } from '@mobile/patterns/chat';
import { InlineConsent } from '@mobile/patterns/widgets';

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

  // Bring the card into view when it appears at the end of the thread.
  const anchor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) anchor.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [open]);

  const widget = open ? (
    <div ref={anchor}>
      <MessageBubble role="deborah" turnStart>
        <InlineConsent onAgree={() => resolve.current?.(true)} onDecline={() => resolve.current?.(false)} />
      </MessageBubble>
    </div>
  ) : null;
  /** True while there are held answers and no consent yet, i.e. `ask` will show the card. */
  const needed = useCallback(() => hasPendingHealthBasics() && !useAppStore.getState().healthConsentAt, []);
  return { ask, needed, widget };
}
