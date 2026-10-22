/** Which answer M-9.6 prints: params.messageId (chat "Save PDF") or a conversation's last answer. */
import { selectMessage, type AppState } from '@shared/store';
import type { Answer, Conversation, Message } from '@shared/types/domain';

export interface PdfSource {
  conversation: Conversation;
  message: Message & { answer: Answer };
}

const hasAnswer = (m: Message | undefined): m is Message & { answer: Answer } => Boolean(m?.answer) && m?.kind === 'answer';

export function resolveSource(s: AppState, params: { messageId?: string; conversationId?: string }): PdfSource | undefined {
  if (params.messageId) {
    const found = selectMessage(s, params.messageId);
    return found && hasAnswer(found.message) ? { conversation: found.conversation, message: found.message } : undefined;
  }
  const conversation = params.conversationId ? s.conversations.byId[params.conversationId] : undefined;
  const message = conversation?.messages.filter(hasAnswer).at(-1);
  return conversation && message ? { conversation, message } : undefined;
}

/** First sentence of a section body, for the "Summary" block. */
export const firstSentence = (text: string) => text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
