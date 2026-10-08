/**
 * useConversation — bridges the active profile's conversation, the pure engine and the runner.
 * Screens call send / answerIntake / skip / requestAnswer / stop; the engine decides the plan.
 */
import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { scripts } from '@shared/data';
import { selectActiveConversation, selectActiveProfile, selectFreeLeft, selectHistory, useAppStore } from '@shared/store';
import type { LabReport } from '@shared/types/domain';
import type { UserInput } from '@shared/types/engine';
import { runInput, stopPlan, useRunnerStore } from '@shared/bridge';
import { useDevice } from '@shell/device';
import { useNav } from '@mobile/navigation';

export function useConversation() {
  const { open, presentSheet } = useNav();
  const { haptic } = useDevice();
  const conversation = useAppStore(selectActiveConversation);
  const profile = useAppStore(selectActiveProfile);
  const freeLeft = useAppStore(selectFreeLeft);
  const history = useAppStore(useShallow(selectHistory));
  const busy = useRunnerStore((s) => (conversation ? Boolean(s.busy[conversation.id]) : false));

  const handlers = useMemo(
    () => ({
      onGate: () => open('M-4.1'),
      onPrompt: () => presentSheet('M-2.8'),
    }),
    [open, presentSheet],
  );

  /** Run one input through the engine. Resolves false if gated (keep the composer text). */
  const run = useCallback((input: UserInput) => runInput(input, handlers), [handlers]);

  /** Resolves false when gated: the text is held for after a purchase (F04 M-4.1). */
  const send = useCallback(
    async (text: string, scriptId?: string) => {
      haptic('light');
      const accepted = await run({ kind: 'text', text, scriptId });
      const s = useAppStore.getState();
      if (!accepted) s.holdMessage(text, scriptId);
      else if (s.heldMessage) s.clearHeld();
      return accepted;
    },
    [run, haptic],
  );

  const removeMessage = (kind: 'error' | 'stopped') => {
    const s = useAppStore.getState();
    const c = selectActiveConversation(s);
    const m = c && [...c.messages].reverse().find((x) => (kind === 'error' ? x.kind === 'error' : x.meta?.stopped));
    if (c && m) s.removeMessage(c.id, m.id);
  };

  return {
    conversation,
    profile,
    freeLeft,
    history,
    busy,
    send,
    answerIntake: (questionId: string, optionIds: string[], otherText?: string) =>
      run({ kind: 'intakeAnswer', questionId, optionIds, otherText }),
    skip: (questionId: string) => run({ kind: 'skip', questionId }),
    requestAnswer: () => run({ kind: 'requestAnswer' }),
    /** Error bubble "tap to try again" and stopped answer "Continue" both re-run the answer. */
    retry: () => {
      removeMessage('error');
      return run({ kind: 'requestAnswer', retry: true });
    },
    continueStopped: () => {
      removeMessage('stopped');
      return run({ kind: 'requestAnswer', retry: true });
    },
    stop: () => conversation && stopPlan(conversation.id),
    acknowledgeEmergency: (messageId: string) => run({ kind: 'acknowledgeEmergency', messageId }),
    /** F05: opened from a follow-up notification (deep link `followup:<profileId>`). */
    startCheckIn: () => run({ kind: 'startCheckIn' }),
    checkInReply: (messageId: string, optionId: string) => run({ kind: 'checkInReply', messageId, optionId }),
    /** M-5.4 "Looks right — send to Deborah": lab-informed answer (counted). */
    shareLabs: (report: LabReport) => run({ kind: 'shareLabs', report }),
    startNew: () => profile && useAppStore.getState().archiveActive(profile.id),
    /** "Continue that conversation": bring the most recent answered conversation back. */
    continueLast: () => {
      const last = history[0];
      if (!last || !profile) return;
      const s = useAppStore.getState();
      s.archiveActive(profile.id);
      s.setConversation(last.id, { archived: false });
      s.setActiveConversation(profile.id, last.id);
    },
    voiceSample: (scripts[conversation?.scriptId ?? 'generic'] ?? scripts.generic).voiceSample,
  };
}
