/**
 * F09c visit debrief quick replies: the engine answers; some options also act in the UI.
 * "Fill it in myself" and "Review and save" open M-9.8 on this conversation's draft.
 */
import { useNav } from '@web/navigation';
import type { useConversation } from '@web/hooks/useConversation';

export function useDebriefReplies(chat: ReturnType<typeof useConversation>, conversationId: string, focusComposer: () => void) {
  const { open } = useNav();
  return (messageId: string, optionId: string) => {
    chat.debriefReply(messageId, optionId);
    if (optionId === 'manual' || optionId === 'review') open('M-9.8', { conversationId });
    // After saving: file a document from the visit (Miro Step 6 · upload supporting documents).
    if (optionId === 'uploadDoc') open('M-11.3');
    if (optionId === 'tell' || optionId === 'testsYes' || optionId === 'medsYes') focusComposer();
  };
}
