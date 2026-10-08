/**
 * F04 / F05 behaviour hosted by M-2.1:
 * - `mode: 'checkin'` (deep link followup:<profileId>) starts the check-in once, then is consumed;
 * - a message held by the free-limit gate is sent after M-4.5 "Continue my conversation";
 * - after the 3rd free answer, M-4.1 shows when the user next acts (focuses the composer) or after
 *   4 s idle at the bottom of the answer — never mid-answer or mid-intake.
 */
import { useCallback, useEffect } from 'react';
import { useAppStore } from '@shared/store';
import type { ConversationStatus } from '@shared/types/domain';
import { useNav, useNavStore, useRoute } from '@mobile/navigation';

const IDLE_MS = 4000;

export interface ReturnFlowsOptions {
  startCheckIn: () => void;
  /** The screen's send (clears the composer, keeps text if gated). */
  send: (text: string, scriptId?: string) => void;
  status: ConversationStatus | undefined;
  busy: boolean;
  atBottom: boolean;
}

export function useReturnFlows({ startCheckIn, send, status, busy, atBottom }: ReturnFlowsOptions) {
  const { route } = useRoute();
  const { open } = useNav();
  const setRouteParams = useNavStore((s) => s.setRouteParams);
  const mode = route.params?.mode;

  useEffect(() => {
    if (mode !== 'checkin') return;
    setRouteParams(route.key, { ...route.params, mode: undefined });
    startCheckIn();
  }, [mode, route, setRouteParams, startCheckIn]);

  const held = useAppStore((s) => s.heldMessage);
  useEffect(() => {
    if (!held?.release) return;
    useAppStore.getState().clearHeld();
    send(held.text, held.scriptId);
  }, [held, send]);

  const pending = useAppStore((s) => s.limitReachedPending);
  const locked = useAppStore((s) => s.isLocked);
  // Only when the Conversation itself is on screen: no sheet (e.g. M-2.8), modal or other tab.
  const onScreen = useNavStore((s) => s.root === 'main' && s.layers.length === 0 && s.activeTab === 'ask' && s.tabs.ask.length === 1);
  const ready = pending && !busy && status === 'answered' && onScreen && !locked;

  useEffect(() => {
    if (!ready || !atBottom) return;
    const id = window.setTimeout(() => open('M-4.1'), IDLE_MS);
    return () => window.clearTimeout(id);
  }, [ready, atBottom, open]);

  /** Composer focus is the user's "next action": returns true when M-4.1 took over. */
  const interceptFocus = useCallback(() => {
    if (!ready) return false;
    open('M-4.1');
    return true;
  }, [ready, open]);

  return { interceptFocus };
}
