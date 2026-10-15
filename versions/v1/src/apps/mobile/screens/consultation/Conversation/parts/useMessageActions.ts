/** Handlers for answer actions, long-press menus and §4 "add to visit questions". */
import { useAppStore } from '@flow-v1/shared/store';
import type { Answer, Message } from '@flow-v1/shared/types/domain';
import { nowFrom, uid } from '@flow-v1/shared/utils';
import { useToast } from '@flow-v1/apps/mobile/hooks/toast.store';
import { useNav } from '@flow-v1/apps/mobile/navigation';
import { answerToText } from './answerText';

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard can be blocked in some browsers; the toast still confirms the demo action.
  }
}

export function useMessageActions(profileId: string | undefined) {
  const toast = useToast();
  const { open } = useNav();

  const saveNote = (title: string, body: string, sourceMessageId: string) => {
    if (!profileId) return;
    const s = useAppStore.getState();
    s.addNote({ id: uid('n'), profileId, kind: 'saved-answer', title, body, updatedAt: nowFrom(s).toISOString(), sourceMessageId });
    toast('Saved to Visit Notes');
  };

  return {
    copyText: async (text: string) => {
      await copy(text);
      toast('Copied');
    },
    saveMessage: (m: Message) => saveNote('Saved from Deborah', m.answer ? answerToText(m.answer) : (m.text ?? ''), m.id),
    saveAnswer: (m: Message, topic: string) => m.answer && saveNote(`Deborah on ${topic}`, answerToText(m.answer), m.id),
    savePdf: (m: Message) => open('M-9.6', { messageId: m.id }),
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
