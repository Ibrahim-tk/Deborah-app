/** Handlers for answer actions, long-press menus and §4 "add to visit questions". */
import { VISIT_NOTES_GATE_TOAST } from '@shared/copy/visitNotes';
import { hasEnoughDetailForVisitBrief } from '@shared/engine';
import { useAppStore } from '@shared/store';
import type { Answer, Message } from '@shared/types/domain';
import { nowFrom, uid } from '@shared/utils';
import { useToast } from '@web/hooks/toast.store';
import { useNav } from '@web/navigation';
import { answerToText } from './answerText';

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard can be blocked in some browsers; the toast still confirms the demo action.
  }
}

function conversationForMessage(messageId: string) {
  const s = useAppStore.getState();
  return Object.values(s.conversations.byId).find((c) => c.messages.some((m) => m.id === messageId));
}

/** `onGateFail` runs after the “Let’s talk first” toast — Conversation focuses the composer. */
export function useMessageActions(profileId: string | undefined, onGateFail?: () => void) {
  const toast = useToast();
  const { open } = useNav();

  const saveNote = (title: string, body: string, sourceMessageId: string) => {
    if (!profileId) return;
    const s = useAppStore.getState();
    s.addNote({ id: uid('n'), profileId, kind: 'saved-answer', title, body, updatedAt: nowFrom(s).toISOString(), sourceMessageId });
    toast('Saved to Visit Notes');
  };

  /** Miro Step 5 gate, shared by Visit Notes, Save PDF and Discuss with provider: enough detail → `onPass`; otherwise “Let’s talk first”, stay on Ask Deborah. */
  const withVisitBriefGate = (m: Message, onPass: (conversationId: string) => void) => {
    const conv = conversationForMessage(m.id);
    if (conv && hasEnoughDetailForVisitBrief(conv)) {
      onPass(conv.id);
      return;
    }
    toast(VISIT_NOTES_GATE_TOAST);
    onGateFail?.();
  };
  const openVisitBriefOrGate = (m: Message) =>
    withVisitBriefGate(m, (conversationId) => open('M-9.7', { messageId: m.id, conversationId }));

  return {
    copyText: async (text: string) => {
      await copy(text);
      toast('Copied');
    },
    saveMessage: (m: Message) => {
      if (m.answer) {
        openVisitBriefOrGate(m);
        return;
      }
      saveNote('Saved from Deborah', m.text ?? '', m.id);
    },
    saveAnswer: (m: Message, _topic: string) => {
      if (m.answer) openVisitBriefOrGate(m);
    },
    savePdf: (m: Message) =>
      withVisitBriefGate(m, (conversationId) => open('M-9.6', { messageId: m.id, conversationId })),
    shareAnswer: async (answer: Answer) => {
      await copy(answerToText(answer));
      toast('Copied');
    },
    listen: () => toast('Reading aloud (demo)'),
    feedback: (helpful: boolean) => toast(helpful ? 'Thank you — glad it helped' : 'Thank you — I’ll keep improving'),
    addQuestion: (q: string) => {
      if (!profileId) return;
      useAppStore.getState().appendToNote(profileId, 'questions', 'Questions for my next visit', q);
      toast('Added to visit questions');
    },
  };
}
