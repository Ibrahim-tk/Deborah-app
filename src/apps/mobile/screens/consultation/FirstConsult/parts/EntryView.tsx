/** One line of the scripted consult, drawn with the chat's own patterns (M-2.1) plus a few flow widgets. */
import { findProduct } from '@shared/data';
import type { FlowNode, FlowOption } from '@shared/types/flow';
import { Button, Panel } from '@mobile/ui';
import { AnswerSections, ClosingLine, MessageBubble, SuggestedQuestions } from '@mobile/patterns/chat';
import { ProductCard } from '@mobile/patterns/commerce';
import { EmergencyInterrupt, EscalationCard } from '@mobile/patterns/safety';
import { buildAnswer } from './buildAnswer';
import { FlowWidget } from './FlowWidget';
import { FlowChoice } from './FlowChoice';
import { FlowText } from './FlowText';
import { ThinkingSteps } from './ThinkingSteps';
import type { Entry } from './useFlowPlayer';
import styles from '../FirstConsult.module.css';

export interface EntryViewProps {
  entry: Entry;
  /** Only the newest waiting entry takes input. */
  active: boolean;
  say: (s?: string) => string;
  known: string[];
  earlyExit?: string;
  onPick: (node: FlowNode, picked: FlowOption[]) => void;
  onAction: (value: string) => void;
  renderPrep: () => React.ReactNode;
}

export function EntryView({ entry, active, say, known, earlyExit, onPick, onAction, renderPrep }: EntryViewProps) {
  if (entry.kind === 'user') return <MessageBubble role="user" text={entry.text} />;
  if (entry.kind === 'thinking') return <ThinkingSteps steps={entry.steps} durationMs={entry.durationMs} />;
  if (entry.kind === 'end') return null;

  const node = entry.node;
  const w = node.widget;

  if (entry.kind === 'answer') {
    const answer = buildAnswer(node, say);
    const product = findProduct(answer.product?.productId);
    const replies = node.suggestedReplies ?? [];
    return (
      <MessageBubble role="deborah" turnStart>
        <AnswerSections
          answer={answer}
          wordSlot={<Button variant="secondary" leadingIcon="note" fullWidth onClick={() => onAction('visit_notes')}>Save to Visit notes</Button>}
          productSlot={product && answer.product && <ProductCard product={product} productRef={answer.product} onShop={() => onAction('exit_product')} />} />
        <ClosingLine text={answer.closingLine} />
        {active && <SuggestedQuestions questions={replies.map((r) => say(r.label))} onSelect={(q) => onPick(node, replies.filter((r) => say(r.label) === q))} />}
      </MessageBubble>
    );
  }

  // Emergency (F03): the existing interrupt replaces the consultation; "I'm safe" continues the script.
  if (node.type === 'emergency') {
    return (
      <EmergencyInterrupt
        title="Please get help now"
        body={entry.text}
        acknowledged={!active}
        onCall={() => onAction('call')}
        onFindER={() => onAction('find_care')}
        onSafe={() => onPick(node, [{ label: 'I’m safe, this isn’t happening now' }])}
      />
    );
  }

  // Safety: the existing escalation card carries Deborah's words and the human path.
  if (node.type === 'safety') {
    return (
      <MessageBubble role="deborah" turnStart>
        <EscalationCard body={entry.text} dismissed={!active} onBook={() => onPick(node, [{ label: 'Book with Deborah', next: 'exit_booking' }])} onDismiss={() => onPick(node, [{ label: 'I understand, continue', next: 'thinking' }])} />
        {active && <Button variant="ghost" fullWidth onClick={() => onAction('find_care')}>Find care near me</Button>}
      </MessageBubble>
    );
  }

  const custom = w && FlowWidget.handles(w.type);
  // The opening line: large serif greeting, no bubble; its starters dock above the composer (FirstConsult).
  if (node.display === 'greeting' && active) return <p className={styles.greetingLine}>{entry.text}</p>;

  const choices = custom ? undefined : w?.options;
  return (
    <MessageBubble role="deborah" text={entry.text} turnStart>
      {/* What Deborah already knows from intake, as plain text (no tags). */}
      {entry.nodeId.startsWith('context') && <p className={styles.known}>{known.join(' · ')}</p>}
      {custom && <FlowWidget widget={w} active={active} say={say} onPick={(picked) => onPick(node, picked)} />}
      {choices && active && (
        <FlowChoice
          label={entry.text}
          options={choices}
          multi={w?.multi}
          exclusive={w?.exclusiveOption}
          step={node.progress}
          onPick={(picked) => onPick(node, picked)}
          onSkip={node.type === 'question' && node.progress ? () => onPick(node, [{ label: 'Skip' }]) : undefined}
          earlyExit={node.progress?.startsWith('1 of') && earlyExit ? { label: earlyExit, onPress: () => onPick(node, [{ label: earlyExit, next: 'thinking' }]) } : undefined}
        />
      )}
      {w?.type === 'free_text' && active && (
        <FlowText
          label={entry.text}
          placeholder={w.placeholder}
          step={node.progress}
          onSend={(text) => onPick(node, [{ label: text, value: text }])}
          onSkip={node.progress ? () => onPick(node, [{ label: 'Skip' }]) : undefined}
        />
      )}
      {w?.type === 'inline_tip' && <Panel tone="lilac" icon="check">{w.text}</Panel>}
      {w?.type === 'visit_prep_card' && renderPrep()}
      {w?.type === 'reminder_chip' && <Panel tone="linen" icon="calendar">{w.label}</Panel>}
      {node.footer && <ClosingLine text={node.footer} />}
    </MessageBubble>
  );
}
