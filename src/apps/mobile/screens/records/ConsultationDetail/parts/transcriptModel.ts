/** Read-only transcript model for M-9.2: intake Q/A folded into one block, plain-text helpers. */
import type { Answer, Conversation, Message } from '@shared/types/domain';

export interface IntakePair {
  id: string;
  question: string;
  answer: string;
}

export type TranscriptItem = { type: 'message'; message: Message } | { type: 'intake'; pairs: IntakePair[] };

const intakeAnswer = (m: Message) => {
  const i = m.intake;
  if (!i) return '';
  if (i.answered?.length) return i.answered.map((id) => i.options.find((o) => o.id === id)?.label ?? id).join(', ');
  return i.skipped ? 'Skipped' : 'Not answered';
};

/**
 * Intake questions (and the user bubble echoing each answer) become one collapsed block at the
 * position of the first question. Transient kinds (thinking, error) are left out.
 */
export function buildTranscript(messages: Message[]): TranscriptItem[] {
  const items: TranscriptItem[] = [];
  let block: Extract<TranscriptItem, { type: 'intake' }> | null = null;
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.kind === 'thinking' || m.kind === 'error') continue;
    if (m.kind === 'intakeQuestion' && m.intake) {
      if (!block) items.push((block = { type: 'intake', pairs: [] }));
      block.pairs.push({ id: m.id, question: m.text ?? '', answer: intakeAnswer(m) });
      const next = messages[i + 1];
      if (m.intake.answered?.length && next?.role === 'user') i++;
      continue;
    }
    items.push({ type: 'message', message: m });
  }
  return items;
}

/** "Intake: 46–50 · None · Irregular" */
export const intakeSummary = (pairs: IntakePair[]) => `Intake: ${pairs.map((p) => p.answer).join(' · ')}`;

/** Plain-text answer for Share / copy (mirrors the chat's copy format). */
export function answerToText(answer: Answer): string {
  const parts = answer.sections.map((s, i) => {
    const bullets = (s.bullets ?? []).map((b) => `• ${b}`).join('\n');
    return [`${i + 1}. ${s.title}`, s.body, bullets].filter(Boolean).join('\n');
  });
  return [...parts, answer.closingLine].join('\n\n');
}

/** Everything shareable from a consultation: its answers, or the user's questions if none yet. */
export function conversationToText(c: Conversation, topic: string): string {
  const answers = c.messages.filter((m) => m.kind === 'answer' && m.answer).map((m) => answerToText(m.answer!));
  const body = answers.length ? answers : c.messages.filter((m) => m.role === 'user' && m.text).map((m) => `• ${m.text}`);
  return [topic, ...body].join('\n\n');
}
