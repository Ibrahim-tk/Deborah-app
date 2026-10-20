/** One line of the scripted consult, drawn with the chat's own patterns (M-2.1) plus a few flow widgets. */
import { findProduct } from '@shared/data';
import type { FlowNode, FlowOption } from '@shared/types/flow';
import { Button, Panel, TextReveal } from '@mobile/ui';
import { AnswerSections, ClosingLine, MessageBubble, SuggestionList } from '@mobile/patterns/chat';
import { ProductCard } from '@mobile/patterns/commerce';
import { EmergencyInterrupt, EscalationCard } from '@mobile/patterns/safety';
import { buildAnswer } from './buildAnswer';
import { FlowWidget } from './FlowWidget';
import { IntakeBanner } from './IntakeBanner';
import { CopyBlock, SessionBanner } from './ProxyBits';
import { EmergencySheet } from './EmergencySheet';
import { ProfileFacts } from './ProfileFacts';
import { VisitNotesCard } from './VisitNotesCard';
import { FlowChoice } from './FlowChoice';
import { BookTile } from './BookTile';
import { FlowText } from './FlowText';
import { ThinkingSteps } from './ThinkingSteps';
import type { Entry } from './useFlowPlayer';
import styles from '../FirstConsult.module.css';

export interface EntryViewProps {
  entry: Entry;
  /** Only the newest waiting entry takes input. */
  active: boolean;
  say: (s?: string) => string;
  onPick: (node: FlowNode, picked: FlowOption[]) => void;
  onAction: (value: string) => void;
  renderPrep: () => React.ReactNode;
  /** Multi-choice picks held in the composer until she sends. */
  selection?: FlowOption[];
  onSelect?: (node: FlowNode, picked: FlowOption[]) => void;
}

export function EntryView({ entry, active, say, onPick, onAction, renderPrep, selection, onSelect }: EntryViewProps) {
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
        />
        {/* Closing line and suggestions arrive once the seven cards have revealed. */}
        <div className={styles.afterReveal}>
          <ClosingLine text={answer.closingLine} />
          {/* After the framework (design direction 2026-10-14): the product, then Deborah herself, then her times. */}
          {product && answer.product && <div className={styles.after}><ProductCard product={product} productRef={answer.product} onShop={() => onAction('exit_product')} /></div>}
          {/* Premade chat: "Save to my profile" sits right under the seven cards, instead of the booking times. */}
          {node.profileFacts ? (
            <ProfileFacts facts={node.profileFacts.map((f) => ({ label: f.label, value: say(f.value) }))} onEdit={() => onAction('edit_profile')} />
          ) : node.next ? null : (
            <>
              <p className={styles.afterLine}>If you’d like to go through this with me in person, I have time this week.</p>
              <BookTile onBook={() => onAction('book_request')} />
            </>
          )}
          {active && replies.length > 0 && (
            <div className={styles.after}>
              <SuggestionList suggestions={replies.map((r) => ({ id: r.label, text: say(r.label), scriptId: '' }))} onSelect={(x) => onPick(node, replies.filter((r) => r.label === x.id))} />
            </div>
          )}
        </div>
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
      <MessageBubble role="deborah" text={entry.text} turnStart>
        <EscalationCard sheet={false} body={entry.text} dismissed={!active} onBook={() => onPick(node, [{ label: 'Book a consult with Deborah', next: 'exit_booking' }])} onDismiss={() => onPick(node, [{ label: 'I understand, continue', next: 'thinking' }])} />
      </MessageBubble>
    );
  }

  // After the answer, once she taps a suggestion: the human path as one quiet tile (design direction 2026-10-14).
  if (w?.type === 'escalation') {
    const [book, notNow] = w.options ?? [];
    return (
      <MessageBubble role="deborah" text={entry.text} turnStart>
        {/* Without options (the safety note) the tile stays as a standing path to Deborah while the chat moves on. */}
        <EscalationCard
          sheet={false}
          body={entry.text}
          dismissed={!book || !active}
          onBook={() => onPick(node, [book ?? { label: 'Book a consult with Deborah', next: 'exit_booking' }])}
          onDismiss={() => notNow && onPick(node, [notNow])}
        />
      </MessageBubble>
    );
  }

  if (w?.type === 'proxy_banner') return <SessionBanner text={say(w.text)} />;
  if (w?.type === 'intake_banner') return <IntakeBanner onComplete={() => onAction('complete_intake')} />;

  const custom = w && FlowWidget.handles(w.type);
  // The opening line: large serif greeting, no bubble; its starters dock above the composer (FirstConsult).
  if (node.display === 'greeting' && active) return <TextReveal className={styles.greetingLine} text={entry.text} delay={250} />;

  const choices = custom ? undefined : w?.options;
  return (
    <MessageBubble role="deborah" text={entry.text} turnStart>
      {/* What Deborah already knows from intake, as plain text (no tags). */}
      {custom && <FlowWidget widget={w} active={active} say={say} onPick={(picked) => onPick(node, picked)} />}
      {choices && active && (
        <FlowChoice
          label={entry.text}
          options={choices}
          multi={w?.multi}
          exclusive={w?.exclusiveOption}
          onPick={(picked) => onPick(node, picked)}
          selected={selection}
          onSelect={onSelect && ((picked) => onSelect(node, picked))}
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
      {w?.type === 'copy_block' && <CopyBlock title={w.title ?? 'Copy'} text={say(w.text)} />}
      {w?.type === 'emergency_sheet' && (
        <EmergencySheet title={w.title ?? 'Call 911 now'} text={say(w.text)} active={active} onDone={() => w.options?.[0] && onPick(node, [w.options[0]])} />
      )}
      {node.visitNotes && <VisitNotesCard notes={node.visitNotes} say={say} onSave={() => onAction('save')} onShare={() => onAction('pdf')} />}
      {w?.type === 'reminder_chip' && <Panel tone="linen" icon="calendar">{w.label}</Panel>}
      {node.footer && <ClosingLine text={node.footer} />}
    </MessageBubble>
  );
}
