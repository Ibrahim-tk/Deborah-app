/**
 * Hard account gate (design direction 2026-10-12): guests browse and chat freely, but a few moments
 * need an account behind them — medical documents, family profiles, the 90-day journey, reminders.
 * With an account `gate` runs the action at once; as a guest it opens the M-4.3 save sheet with the
 * reason, and runs the action once the profile is saved.
 */
import { useCallback } from 'react';
import { useAppStore } from '@shared/store';
import { useNav } from '@mobile/navigation';

export type GateReason = 'documents' | 'family' | 'journey' | 'reminders';

export const GATE_COPY: Record<GateReason, string> = {
  documents: 'To keep your medical records secure, let’s save your account.',
  family: 'Family profiles hold other people’s health details, so let’s save your account first.',
  journey: 'Your 90-day journey runs for months, so let’s save your account to keep it safe.',
  reminders: 'Reminders need an account to reach you, so let’s save yours first.',
};

/** Nav params are plain values, so the gated action waits here until M-4.3 saves (in memory only). */
let pending: (() => void) | null = null;

/** M-4.3 calls this after a successful save or sign-in; the gated action then continues. */
export function resumeGate() {
  const action = pending;
  pending = null;
  action?.();
}

export function useAccountGate() {
  const { presentSheet } = useNav();
  return useCallback(
    (reason: GateReason, action: () => void) => {
      if (useAppStore.getState().accountId) return action();
      pending = action;
      presentSheet('M-4.3', { sheet: true, reason });
    },
    [presentSheet],
  );
}
