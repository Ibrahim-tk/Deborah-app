/** Renders the conversation's messages by kind, plus the thinking line and answer CTA. */
import { consentDoc, DEBRIEF_SCRIPT_ID, findProduct, productList, scripts } from '@shared/data';
import { ANSWER_REQUEST_LABEL, isMinor } from '@shared/engine';
import { FLAGS } from '@shared/flags';
import { selectActiveProfile, useAppStore } from '@shared/store';
import { nowFrom } from '@shared/utils';
import { formatShortDate } from '@shared/utils';
import type { Conversation, Message } from '@shared/types/domain';
import { DeborahBlob } from '@mobile/ui';
import { ProductCard, ShopTiles } from '@mobile/patterns/commerce';
import {
  AnswerActions,
  AnswerCTA,
  AnswerSections,
  CareDisclaimer,
  ClosingLine,
  ErrorBubble,
  GuidanceNextSteps,
  type GuidanceNextId,
  IntakeQuestion,
  MessageBubble,
  QuickReplies,
  ReviewFactsCard,
  SuggestedQuestions,
  ThinkingIndicator,
  VisitSummaryCard,
} from '@mobile/patterns/chat';
import type { useConversation } from '@mobile/hooks/useConversation';
import type { useMessageActions } from './useMessageActions';
import { SafetyMessage } from './SafetyMessage';
import { DocumentMessage } from './DocumentMessage';
import { useDebriefReplies } from './useDebriefReplies';
import { SaveToProfile } from './SaveToProfile';
import { SAFETY_KINDS } from './safetyKinds';
import styles from '../Conversation.module.css';

export interface MessageListProps {
  /** Consent question's "Connect to Apple Health". */
  conversation: Conversation;
  busy: boolean;
  chat: ReturnType<typeof useConversation>;
  actions: ReturnType<typeof useMessageActions>;
  onShop: (productId: string) => void;
  onBook: () => void;
  onUploadLabs: () => void;
  onRestartPlan: () => void;
  onVisitNotes: () => void;
  onOpenPlan: () => void;
  onTeamBook: () => void;
  onLongPress: (m: Message) => void;
  onFocusComposer: () => void;
  /** F02d: hide/show bottom composer while intake owns choices vs typing. */
  onIntakeAnswerSurface?: (surface: 'choices' | 'composer') => void;
  /** DN-13: Edit on the Review and Confirm card (M-2.13). */
  onEditFacts: () => void;
}


export function MessageList({
  conversation,
  busy,
  chat,
  actions,
  onShop,
  onBook,
  onUploadLabs,
  onRestartPlan,
  onVisitNotes,
  onOpenPlan,
  onTeamBook,
  onLongPress,
  onFocusComposer,
  onIntakeAnswerSurface,
  onEditFacts,
}: MessageListProps) {
  const { messages, status } = conversation;
  const reports = useAppStore((s) => s.labs.reportsById);
  const hasPlan = useAppStore((s) => Boolean(s.plan90[conversation.profileId]));
  // Login flow: answered widgets stay visible in the thread (design 2026-10-20).
  const keepAnswered = useAppStore((s) => s.authFlow === 'login');
  // DN-12: no products for anyone under 18, the shop tiles included.
  const minor = useAppStore((s) => { const p = selectActiveProfile(s); return p ? isMinor(p, nowFrom(s)) : false; });
  const profileName = useAppStore((s) => selectActiveProfile(s)?.name ?? '');

  // Check-in quick replies: the engine answers; some options also act in the UI.
  const debriefReply = useDebriefReplies(chat, conversation.id, onFocusComposer);
  const reply = (messageId: string, optionId: string) => {
    const offer = messages.find((x) => x.id === messageId);
    if (offer?.kind === 'documentOffer') return chat.documentOfferReply(messageId, optionId, offer.meta?.documentId);
    // F09c: debrief replies, and the "Log my visit" offer from any chat.
    if (conversation.scriptId === DEBRIEF_SCRIPT_ID || optionId.startsWith('offer')) return debriefReply(messageId, optionId);
    chat.checkInReply(messageId, optionId);
    if (optionId === 'restartPlan') onRestartPlan();
    if (optionId === 'talk') onFocusComposer();
  };
  const lastDeborahIndex = messages.map((m) => m.role).lastIndexOf('deborah');
  const lastIntakeIndex = messages.map((m) => m.kind).lastIndexOf('intakeQuestion');
  const firstAnswer = messages.findIndex((m) => m.kind === 'answer' || m.kind === 'medicationSafety');
  const disclaimerSeen = useAppStore((s) => Boolean(s.disclaimerSeenAt));

  const renderOne = (m: Message, i: number) => {
    const turnStart = m.role === 'deborah' && messages[i - 1]?.role !== 'deborah';
    const isLatestDeborah = i === lastDeborahIndex;
    const placeholder = m.meta?.status === 'placeholder';
    // F11: Deborah's reply to a shared document offers its own questions even in an empty chat.
    const docReply = m.role === 'deborah' && Boolean(m.meta?.documentId) && m.kind === 'text';
    const showSuggestions = isLatestDeborah && !busy && (status === 'ready' || status === 'answered' || docReply) && (m.suggestions?.length ?? 0) > 0;

    if (m.role === 'user' && m.meta?.documentId) return <DocumentMessage key={m.id} documentId={m.meta.documentId} />;
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

    if (m.kind === 'reviewFacts') {
      const s = useAppStore.getState();
      return (
        <MessageBubble key={m.id} role="deborah" turnStart={turnStart}>
          <ReviewFactsCard
            facts={conversation.facts ?? []}
            onConfirm={(keep, drop) => { s.confirmFacts(conversation.id, keep); s.discardFacts(conversation.id, drop); }}
            onEdit={onEditFacts}
            onDiscard={(ids) => s.discardFacts(conversation.id, ids)}
          />
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
      const latestAnswer = [...messages].reverse().find((x) => x.kind === 'answer' && !x.meta?.streaming);
      const showNext = Boolean(done && conversation.guidanceGivenAt && latestAnswer?.id === m.id && status === 'answered' && !conversation.redFlag);
      const onNext = (id: GuidanceNextId) => {
        if (id === 'followUp') onFocusComposer();
        else if (id === 'provider' || id === 'save') {
          // Miro Step 5: open structured brief (or “Let’s talk first” gate) — not empty M-9.4.
          actions.saveAnswer(m, conversation.topic ?? 'your question');
        } else if (id === 'book') onTeamBook();
        else if (id === 'labs') onUploadLabs();
        else if (id === 'product' && product) onShop(product.id);
        else if (id === 'plan') onOpenPlan();
      };
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
                onVisitNotes={onVisitNotes}
                onShare={() => m.answer && actions.shareAnswer(m.answer)}
                onCopy={() => m.answer && actions.shareAnswer(m.answer)}
                onListen={actions.listen}
                onFeedback={actions.feedback}
                onBook={lab ? onBook : undefined}
              />
              {!minor && !conversation.noProduct && !conversation.redFlag && <ShopTiles
                products={productList.filter((p) => p.id !== product?.id)}
                title="Deborah’s formulations"
                onShop={onShop}
              />}
              {showNext && (
                <GuidanceNextSteps
                  disabled={busy}
                  showProduct={Boolean(product && !minor && !conversation.noProduct)}
                  showPlan={hasPlan}
                  onSelect={onNext}
                />
              )}
              {showNext && scripts[conversation.scriptId ?? '']?.ownIntake && profileName && <SaveToProfile name={profileName} />}
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
    // Prototype: skip health-consent card — still mount IntakeQuestion so it can auto-agree.
    if (FLAGS.skipHealthConsent && intake?.questionId === 'health-consent' && !m.meta?.streaming) {
      return (
        <IntakeQuestion
          key={m.id}
          intake={intake}
          prompt={m.text}
          active={intakeActive}
          onAnswer={(ids, other) => chat.answerIntake(intake.questionId, ids, other)}
          onSkip={() => chat.skip(intake.questionId)}
          onOther={onFocusComposer}
          onAnswerSurface={onIntakeAnswerSurface}
        />
      );
    }
    return (
      <MessageBubble
        key={m.id}
        role="deborah"
        text={intake?.questionId === 'health-consent' && !m.meta?.streaming ? undefined : m.text}
        streaming={m.meta?.streaming}
        turnStart={turnStart}
        placeholder={placeholder}
        onLongPress={() => onLongPress(m)}
      >
        {/* The actual /wid widgets answer inline; only this question is interactive. */}
        {intake && !m.meta?.streaming && (
          <IntakeQuestion
            intake={intake}
            prompt={m.text}
            active={intakeActive}
            onAnswer={(ids, other) => chat.answerIntake(intake.questionId, ids, other)}
            onSkip={() => chat.skip(intake.questionId)}
            onOther={onFocusComposer}
            onAnswerSurface={onIntakeAnswerSurface}
          />
        )}
        {m.visitSummary && !m.meta?.streaming && <VisitSummaryCard lines={m.visitSummary} />}
        {/* Login flow: answered widgets stay in the thread beside her reply (design 2026-10-20). */}
        {quick && (quickActive || (keepAnswered && quick.answered)) && (
          <QuickReplies
            options={quick.options}
            label={m.kind === 'labRequest' ? 'Lab results' : m.kind === 'documentOffer' ? 'Your document' : conversation.scriptId === DEBRIEF_SCRIPT_ID ? 'Your visit' : 'How did it go?'}
            primary={m.kind === 'labRequest' ? { label: 'Upload my labs', icon: 'upload', onPress: onUploadLabs } : undefined}
            onSelect={(id) => reply(m.id, id)}
            answered={quickActive ? undefined : quick.answered}
          />
        )}
        {showSuggestions && <SuggestedQuestions questions={m.suggestions ?? []} onSelect={(q) => chat.send(q)} />}
      </MessageBubble>
    );
  };

  return (
    <>
      {messages.map((m, i) => [
        // The care disclaimer appears once, right before the first medical answer.
        i === firstAnswer && !disclaimerSeen && (
          <CareDisclaimer key="care" text={consentDoc.careLine} onDismiss={() => useAppStore.getState().dismissDisclaimer()} />
        ),
        // A chat that opens with Deborah (first-visit onboarding) shows her orb once, top left.
        i === 0 && m.role === 'deborah' && <DeborahBlob key="orb" size={44} label="Deborah" className={styles.firstOrb} />,
        renderOne(m, i),
      ])}

      {conversation.thinking && <ThinkingIndicator label={conversation.thinking} />}

      {/* "Tell me what you think" only once Deborah has enough context to answer (intake done). */}
      {!busy && status === 'ready' && (
        <div className={styles.cta}>
          <AnswerCTA label={ANSWER_REQUEST_LABEL} emphasis="primary" onPress={chat.requestAnswer} />
        </div>
      )}
    </>
  );
}
