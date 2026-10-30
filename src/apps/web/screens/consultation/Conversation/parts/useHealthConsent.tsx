/**
 * First message after sign-up: Deborah asks for health-data consent (with the data-protection promise and
 * the disclaimer) as an inline widget in the thread, not a bottom sheet (design direction 2026-10-14);
 * then the held health basics are saved and Oracle answers directly.
 * OPEN: "Not now" keeps the answers held; Deborah then asks for consent in chat as before.
 *
 * Prototype: FLAGS.skipHealthConsent auto-accepts and never renders InlineConsent.
 * After revoke, the next chat start asks again in the same sheet, even while that flag is on.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { FLAGS } from '@shared/flags';
import { useAppStore } from '@shared/store';
import { hasPendingHealthBasics, saveHealthBasics } from '@web/hooks/healthBasics';
import { MessageBubble } from '@web/patterns/chat';
import { InlineConsent, MedicalConsentSheet } from '@web/patterns/widgets';

export function useHealthConsent() {
  const [open, setOpen] = useState(false);
  const resolve = useRef<(agreed: boolean) => void>(undefined);

  const [sheet, setSheet] = useState(false);

  const flight = useRef<Promise<void> | null>(null);

  const ask = useCallback(async () => {
    if (flight.current) return flight.current;
    const run = (async () => {
      const s = useAppStore.getState();
      const reconsent = Boolean(s.healthConsentRevoked && !s.healthConsentAt);
      // Sign-up once, and again after revoke (design 2026-10-20): medical consent in a bottom sheet before Oracle's first answer.
      if ((s.authFlow === 'signup' && !s.healthConsentAt) || reconsent) {
        setSheet(true);
        await new Promise<boolean>((r) => { resolve.current = r; });
        setSheet(false);
        useAppStore.getState().acceptHealthConsent();
        if (hasPendingHealthBasics()) saveHealthBasics();
        return;
      }
      if (!hasPendingHealthBasics()) return;
      if (FLAGS.skipHealthConsent) {
        if (!s.healthConsentAt) s.acceptHealthConsent();
        saveHealthBasics();
        return;
      }
      if (!s.healthConsentAt) {
        setOpen(true);
        const agreed = await new Promise<boolean>((r) => { resolve.current = r; });
        setOpen(false);
        if (!agreed) return;
        s.acceptHealthConsent();
      }
      saveHealthBasics();
    })();
    const tracked = run.finally(() => { flight.current = null; });
    flight.current = tracked;
    return tracked;
  }, []);

  // Bring the card into view when it appears at the end of the thread.
  const anchor = useRef<HTMLDivElement>(null);
  // Only the thread's own scroller moves: scrollIntoView would also shift the phone's overflow-hidden
  // ancestors, leaving the whole screen scrolled up.
  useEffect(() => {
    if (FLAGS.skipHealthConsent) return;
    let el = anchor.current?.parentElement;
    while (el && !/(auto|scroll)/.test(getComputedStyle(el).overflowY)) el = el.parentElement;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [open]);

  const inline = !FLAGS.skipHealthConsent && open ? (
    <div ref={anchor}>
      <MessageBubble role="deborah" turnStart>
        <InlineConsent onAgree={() => resolve.current?.(true)} onDecline={() => resolve.current?.(false)} />
      </MessageBubble>
    </div>
  ) : null;
  const widget = (
    <>
      {inline}
      <MedicalConsentSheet open={sheet} onAgree={() => resolve.current?.(true)} />
    </>
  );
  /** True while there are held answers and no consent yet, i.e. `ask` will show the card. */
  const needed = useCallback(
    () => {
      const s = useAppStore.getState();
      if (s.healthConsentRevoked && !s.healthConsentAt) return true;
      if (s.authFlow === 'signup') return !s.healthConsentAt;
      return !FLAGS.skipHealthConsent && hasPendingHealthBasics() && !s.healthConsentAt;
    },
    [],
  );
  return { ask, needed, widget };
}
