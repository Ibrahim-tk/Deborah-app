/** Renders the conversation's messages by kind, plus the thinking line and answer CTA. */
import { findProduct, intakeData, productList } from '@shared/data';
import { ANSWER_REQUEST_LABEL } from '@shared/engine';
import { useAppStore } from '@shared/store';
import { formatShortDate } from '@shared/utils';
import type { Conversation, Message } from '@shared/types/domain';
import { ProductCard, ShopTiles } from '@mobile/patterns/commerce';
import {
  AnswerActions,
  AnswerCTA,
  AnswerSections,
  ClosingLine,
  ErrorBubble,
  IntakeQuestion,
  MessageBubble,
  QuickReplies,
  SuggestedQuestions,
  ThinkingIndicator,
} from '@mobile/patterns/chat';
import type { useConversation } from '@mobile/hooks/useConversation';
import type { useMessageActions } from './useMessageActions';
import { SafetyMessage } from './SafetyMessage';
import { SAFETY_KINDS } from './safetyKinds';
import styles from '../Conversation.module.css';

export interface MessageListProps {
  conversation: Conversation;
  busy: boolean;
  chat: ReturnType<typeof useConversation>;
  actions: ReturnType<typeof useMessageActions>;
  onShop: (productId: string) => void;
  onBook: () => void;
  onUploadLabs: () => void;
  onRestartPlan: () => void;
  onLongPress: (m: Message) => void;
  onFocusComposer: () => void;
}

const layoutFor = (questionId: string) => intakeData.questions.find((q) => q.id === questionId)?.layout ?? 'list';

export function MessageList({ conversation, busy, chat, actions, onShop, onBook, onUploadLabs, onRestartPlan, onLongPress, onFocusComposer }: MessageListProps) {
  const { messages, status } = conversation;
  const reports = useAppStore((s) => s.labs.reportsById);

  // Check-in quick replies: the engine answers; some options also act in the UI.
  const reply = (messageId: string, optionId: string) => {
    chat.checkInReply(messageId, optionId);
    if (optionId === 'restartPlan') onRestartPlan();
    if (optionId === 'talk') onFocusComposer();
  };
  const lastDeborahIndex = messages.map((m) => m.role).lastIndexOf('deborah');
  const lastIntakeIndex = messages.map((m) => m.kind).lastIndexOf('intakeQuestion');

  return (
    <>
      {messages.map((m, i) => {
        const turnStart = m.role === 'deborah' && messages[i - 1]?.role !== 'deborah';
        const isLatestDeborah = i === lastDeborahIndex;
        const placeholder = m.meta?.status === 'placeholder';
        const showSuggestions = isLatestDeborah && !busy && (status === 'ready' || status === 'answered') && (m.suggestions?.length ?? 0) > 0;

        if (m.role === 'user') return <MessageBubble key={m.id} role="user" text={m.text} />;

        if (SAFETY_KINDS.has(m.kind)) {
          // Out-of-scope keeps Deborah's own unboxed text above its options; cards stand alone.
          const ownText = m.kind === 'outOfScope' || m.kind === 'escalation';
          return (
            <MessageBubble
              key={m.id}
              role="deborah"
              text={m.kind === 'outOfScope' ? m.text : undefined}
              streaming={m.meta?.streaming}
              turnStart={turnStart && ownText}
              placeholder={placeholder}
            >
              {!m.meta?.streaming && <SafetyMessage message={m} conversationId={conversation.id} busy={busy} chat={chat} onFocusComposer={onFocusComposer} />}
            </MessageBubble>
          );
        }

        if (m.kind === 'error') {
          return (
            <MessageBubble key={m.id} role="deborah" turnStart={turnStart}>
              <ErrorBubble kind="error" text={m.text} onRetry={chat.retry} disabled={busy} />
            </MessageBubble>
          );
        }

        if (m.kind === 'answer' && m.answer) {
          const done = !m.meta?.streaming && !m.meta?.stopped;
          const product = findProduct(m.answer.product?.productId);
          const lab = m.answer.labsReferenced?.map((id) => reports[id]).find(Boolean);
          return (
            <MessageBubble key={m.id} role="deborah" turnStart={turnStart}>
              <AnswerSections
                answer={m.answer}
                streaming={m.meta?.streaming}
                activeSection={m.meta?.activeSection}
                onAddQuestion={actions.addQuestion}
                labsNote={lab?.collectedAt ? `Based on your labs from ${formatShortDate(lab.collectedAt)}` : undefined}
                productSlot={
                  product && m.answer.product && <ProductCard product={product} productRef={m.answer.product} onShop={() => onShop(product.id)} />
                }
              />
              {m.meta?.stopped && <ErrorBubble kind="stopped" onRetry={chat.continueStopped} disabled={busy} />}
              {done && (
                <>
                  <ClosingLine text={m.answer.closingLine} />
                  <AnswerActions
                    onSavePdf={() => actions.savePdf(m)}
                    onVisitNotes={() => actions.saveAnswer(m, conversation.topic ?? 'your question')}
                    onShare={() => m.answer && actions.shareAnswer(m.answer)}
                    onCopy={() => m.answer && actions.shareAnswer(m.answer)}
                    onListen={actions.listen}
                    onFeedback={actions.feedback}
                    onBook={lab ? onBook : undefined}
                  />
                  <ShopTiles
                    products={productList.filter((p) => p.id !== product?.id)}
                    title="Deborah’s formulations"
                    onShop={onShop}
                  />
                </>
              )}
              {showSuggestions && <SuggestedQuestions questions={m.suggestions ?? []} onSelect={(q) => chat.send(q)} />}
            </MessageBubble>
          );
        }

        // Deborah text, intake questions, check-in and lab request.
        const intake = m.kind === 'intakeQuestion' ? m.intake : undefined;
        const quick = m.quickReplies;
        const quickActive = Boolean(quick) && isLatestDeborah && !busy && !m.meta?.streaming && !quick?.answered;
        const intakeActive =
          Boolean(intake) && i === lastIntakeIndex && status === 'intake' && !busy && !m.meta?.streaming && !intake?.answered && !intake?.skipped;
        return (
          <MessageBubble
            key={m.id}
            role="deborah"
            text={m.text}
            streaming={m.meta?.streaming}
            turnStart={turnStart}
            placeholder={placeholder}
            onLongPress={() => onLongPress(m)}
          >
            {intake && (
              <IntakeQuestion
                intake={intake}
                layout={layoutFor(intake.questionId)}
                active={intakeActive}
                onAnswer={(ids, other) => chat.answerIntake(intake.questionId, ids, other)}
                onSkip={() => chat.skip(intake.questionId)}
              />
            )}
            {quick && quickActive && (
              <QuickReplies
                options={quick.options}
                label={m.kind === 'labRequest' ? 'Lab results' : 'How did it go?'}
                primary={m.kind === 'labRequest' ? { label: 'Upload my labs', icon: 'upload', onPress: onUploadLabs } : undefined}
                onSelect={(id) => reply(m.id, id)}
              />
            )}
            {showSuggestions && <SuggestedQuestions questions={m.suggestions ?? []} onSelect={(q) => chat.send(q)} />}
          </MessageBubble>
        );
      })}

      {conversation.thinking && <ThinkingIndicator label={conversation.thinking} />}

      {!busy && (status === 'intake' || status === 'ready') && (
        <div className={styles.cta}>
          <AnswerCTA label={ANSWER_REQUEST_LABEL} emphasis={status === 'ready' ? 'primary' : 'secondary'} onPress={chat.requestAnswer} />
        </div>
      )}
    </>
  );
}
