/** Read-only transcript: user + Deborah bubbles, folded intake, full answers (no live actions). */
import { findProduct } from '@shared/data';
import { useAppStore } from '@shared/store';
import type { Message } from '@shared/types/domain';
import { formatShortDate } from '@shared/utils';
import { AnswerSections, ClosingLine, MessageBubble } from '@mobile/patterns/chat';
import { ProductCard } from '@mobile/patterns/commerce';
import { IntakeSummary } from './IntakeSummary';
import { buildTranscript } from './transcriptModel';
import styles from './Transcript.module.css';

export interface TranscriptProps {
  messages: Message[];
  onShop: (productId: string) => void;
}

// Safety cards are interactive in chat; here they are summarised as plain Deborah text.
const SAFETY_FALLBACK: Partial<Record<Message['kind'], string>> = {
  emergency: 'I shared emergency guidance here.',
  crisis: 'I shared crisis support resources here.',
  medicationSafety: 'I shared a medication safety note here.',
  escalation: 'I suggested talking this through with a provider.',
  outOfScope: 'That question was outside what I can help with here.',
};

export function Transcript({ messages, onShop }: TranscriptProps) {
  const reports = useAppStore((s) => s.labs.reportsById);
  const items = buildTranscript(messages);

  return (
    <div className={styles.root}>
      {items.map((item, i) => {
        if (item.type === 'intake') return <IntakeSummary key={`intake-${item.pairs[0].id}`} pairs={item.pairs} />;
        const m = item.message;
        const prev = items[i - 1];
        const turnStart = m.role === 'deborah' && !(prev?.type === 'message' && prev.message.role === 'deborah');
        const placeholder = m.meta?.status === 'placeholder' || m.answer?.status === 'placeholder';

        if (m.role === 'system') return <p key={m.id} className={styles.system}>{m.text}</p>;
        if (m.role === 'user') return <MessageBubble key={m.id} role="user" text={m.text} />;

        if (m.kind === 'answer' && m.answer) {
          const product = findProduct(m.answer.product?.productId);
          const lab = m.answer.labsReferenced?.map((id) => reports[id]).find(Boolean);
          return (
            <MessageBubble key={m.id} role="deborah" turnStart={turnStart} placeholder={placeholder}>
              <AnswerSections
                answer={m.answer}
                labsNote={lab?.collectedAt ? `Based on your labs from ${formatShortDate(lab.collectedAt)}` : undefined}
                productSlot={product && m.answer.product && <ProductCard product={product} productRef={m.answer.product} onShop={() => onShop(product.id)} />}
              />
              <ClosingLine text={m.answer.closingLine} />
            </MessageBubble>
          );
        }

        const text = m.text || SAFETY_FALLBACK[m.kind];
        if (!text) return null;
        return <MessageBubble key={m.id} role="deborah" text={text} turnStart={turnStart} placeholder={placeholder} />;
      })}
    </div>
  );
}
