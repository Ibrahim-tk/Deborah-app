/** One line of the scripted consult, drawn with the chat's own patterns (M-2.1) plus a few flow widgets. */
import { isMinor } from '@shared/engine';
import { selectActiveProfile, useAppStore } from '@shared/store';
import { findProduct } from '@shared/data';
import { formatShortDate, nowFrom } from '@shared/utils';
import type { FlowNode, FlowOption } from '@shared/types/flow';
import { Button, Panel, TextReveal } from '@web/ui';
import { AfterGuidanceTrail, AnswerSections, ClosingLine, MessageBubble, SuggestionList } from '@web/patterns/chat';
import { ProductCard, ProductDisclosure } from '@web/patterns/commerce';
import { EmergencyInterrupt, EscalationCard } from '@web/patterns/safety';
import { buildAnswer } from './buildAnswer';
import { FlowWidget } from './FlowWidget';
import { IntakeBanner } from './IntakeBanner';
import { CopyBlock, SessionBanner } from './ProxyBits';
import { EmergencySheet } from './EmergencySheet';
import { FlowChoice } from './FlowChoice';
import { FlowText } from './FlowText';
import { ThinkingSteps } from './ThinkingSteps';
import { AppointmentForm, type Appointment } from './AppointmentForm';
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
  /** Visit-notes card for `visit_notes_card` — same card as Records, with Open in chat. */
  renderNotesCard?: (title: string) => React.ReactNode;
  /** `appointment_form` saved: provider + date. */
  onAppointment?: (a: Appointment) => void;
  /** "Create visit notes" pill: ask about an appointment instead of opening the notes screen. */
  onCreateVisitNotes?: () => void;
  /** Multi-choice picks held in the composer until she sends. */
  selection?: FlowOption[];
  onSelect?: (node: FlowNode, picked: FlowOption[]) => void;
}

export function EntryView({ entry, active, say, onPick, onAction, renderPrep, renderNotesCard, onAppointment, onCreateVisitNotes, selection, onSelect }: EntryViewProps) {
  // Oct 27: no product cards or mentions for minors (13–17 and children).
  const minor = useAppStore((s) => { const p = selectActiveProfile(s); return p ? isMinor(p, nowFrom(s)) : false; });
  if (entry.kind === 'user') return <MessageBubble role="user" text={entry.text} />;
  if (entry.kind === 'thinking') return <ThinkingSteps steps={entry.steps} durationMs={entry.durationMs} />;
  if (entry.kind === 'end') return null;

  const node = entry.node;
  const w = node.widget;

  if (entry.kind === 'answer') {
    const answer = buildAnswer(node, say);
    const product = findProduct(answer.product?.productId);
    const replies = node.suggestedReplies ?? [];
    const facts = node.profileFacts?.map((f) => ({ label: f.label, value: say(f.value) }));
    return (
      <MessageBubble role="deborah" turnStart>
        <AnswerSections
          answer={answer}
          wordSlot={<Button variant="secondary" leadingIcon="note" fullWidth onClick={() => onAction('visit_notes')}>Save to Visit notes</Button>}
          productSlot={
            product && answer.product
              ? !minor && <ProductCard product={product} productRef={answer.product} onShop={() => onAction('exit_product')} />
              : undefined
          }
        />
        {/* F02g: note → save-facts → bridge → consult ad → two choices (Genesis Gold always). */}
        <div className={styles.afterReveal}>
          <ClosingLine text={answer.closingLine} />
          <AfterGuidanceTrail
            facts={facts}
            notice={entry.safetyText}
            showVisitNotes
            onEditFacts={() => onAction('edit_profile')}
            onBook={() => onAction('book_request')}
            onLearnGold={() => onAction('exit_product')}
            onVisitNotes={() => (onCreateVisitNotes ? onCreateVisitNotes() : onAction('visit_notes'))}
          />
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
        <EscalationCard sheet={false} body={entry.text} dismissed={!active} onBook={() => onPick(node, [{ label: 'Consult with support team', next: 'exit_booking' }])} onDismiss={() => onPick(node, [{ label: 'I understand, continue', next: 'thinking' }])} />
      </MessageBubble>
    );
  }

  // After the answer, once she taps a suggestion: the human path as one quiet tile (design direction 2026-10-14).
  if (w?.type === 'escalation') {
    const [book, notNow] = w.options ?? [];
    return (
      <MessageBubble role="deborah" text={entry.text} turnStart>
        {/* Without options (the safety note) the tile stays as a standing path to the Oracle while the chat moves on. */}
        <EscalationCard
          sheet={false}
          body={entry.text}
          dismissed={!book || !active}
          onBook={() => onPick(node, [book ?? { label: 'Consult with support team', next: 'exit_booking' }])}
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

  const choices = custom || w?.type === 'call_sheet' ? undefined : w?.options;
  return (
    <MessageBubble role="deborah" text={entry.text} turnStart>
      {/* What the Oracle already knows from intake, as plain text (no tags). */}
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
      {w?.type === 'call_sheet' && (
        <EmergencySheet
          title={w.title ?? 'Call 911'}
          text={say(w.text)}
          secondary={say(w.options?.[0]?.label) || "I'm safe, we can keep going"}
          active={active}
          onDone={() => w.options?.[0] && onPick(node, [w.options[0]])}
        />
      )}
      {w?.type === 'visit_notes_button' && (
        <div className={styles.widget}><Button leadingIcon="note" onClick={() => onAction('visit_notes')}>{w.label ?? 'Visit Notes'}</Button></div>
      )}
      {w?.type === 'appointment_form' && (
        <AppointmentForm
          active={active}
          onSave={(a) => {
            onAppointment?.(a);
            onPick(node, [{ label: formatShortDate(a.date), value: a.date, reply: `${a.provider ? `With ${a.provider}, ` : ''}${formatShortDate(a.date)}.` }]);
          }}
        />
      )}
      {w?.type === 'visit_notes_card' && renderNotesCard?.(w.title ?? 'Your visit notes')}
      {w?.type === 'product_card' && !minor && (() => {
        const p = findProduct(w.productId ?? 'genesis-gold');
        if (!p) return null;
        return (
          <div className={styles.after}>
            <ProductCard
              product={p}
              productRef={{ productId: p.id, why: say(w.why) || p.tagline, frame90: say(w.frame90) || '' }}
              onShop={() => onAction('exit_product')}
            />
            <ProductDisclosure />
          </div>
        );
      })()}
      {w?.type === 'reminder_chip' && <Panel tone="linen" icon="calendar">{w.label}</Panel>}
      {node.footer && <ClosingLine text={node.footer} />}
    </MessageBubble>
  );
}
