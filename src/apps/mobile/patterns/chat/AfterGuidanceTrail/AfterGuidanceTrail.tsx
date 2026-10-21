/**
 * @pattern AfterGuidanceTrail — fixed stack after the seven frameworks (F02g)
 * @usedBy  M-2.1 First Consult + Conversation
 * @spec    docs/ux/F02g-after-guidance-trail.md
 */
import { InlineChoicePills } from '@mobile/patterns/widgets';
import { EscalationCard } from '@mobile/patterns/safety';
import { DEMO_HEALTH_FACTS, SaveHealthProfile, type HealthFact } from '../SaveHealthProfile';
import styles from './AfterGuidanceTrail.module.css';

export interface AfterGuidanceTrailProps {
  /** Facts to offer for the health profile; defaults to demo seed when empty. */
  facts?: HealthFact[];
  /** Hide the save card entirely (no profile change this turn). */
  hideSave?: boolean;
  bridgeLines?: string[];
  ask?: string;
  /** Second pill — visit notes when applicable. */
  showVisitNotes?: boolean;
  /** Safety line held until after the answer. Sits once, above the single consult card. */
  notice?: string;
  onEditFacts?: () => void;
  onBook?: () => void;
  onLearnGold?: () => void;
  onVisitNotes?: () => void;
  onFollowUp?: () => void;
}

const DEFAULT_BRIDGE = [
  'You’re noticing a pattern, and it’s worth keeping hold of.',
  'I’ve noted what we covered today so it’s ready if you need it later.',
];

const DEFAULT_ASK =
  'Would you like to learn more about Genesis Gold®, or would visit notes be more useful right now?';

const LEARN_GOLD = 'Learn more about Genesis Gold®';
const VISIT_NOTES = 'Create visit notes';
const FOLLOW_UP = 'Ask a follow-up';

export function AfterGuidanceTrail({
  facts,
  hideSave,
  bridgeLines = DEFAULT_BRIDGE,
  ask = DEFAULT_ASK,
  showVisitNotes = true,
  notice,
  onEditFacts,
  onBook,
  onLearnGold,
  onVisitNotes,
  onFollowUp,
}: AfterGuidanceTrailProps) {
  const list = facts?.length ? facts : DEMO_HEALTH_FACTS;
  const lines = bridgeLines.slice(0, 3);
  const second = showVisitNotes ? VISIT_NOTES : FOLLOW_UP;

  return (
    <div className={styles.root}>
      {!hideSave && (
        <div className={styles.block}>
          <SaveHealthProfile facts={list} onEdit={onEditFacts} />
        </div>
      )}
      {lines.length > 0 && (
        <div className={styles.bridge}>
          {lines.map((line) => (
            <p key={line} className={styles.line}>{line}</p>
          ))}
        </div>
      )}
      {notice && <p className={styles.line}>{notice}</p>}
      <div className={styles.block}>
        <EscalationCard
          sheet={false}
          body="If you’d like to go through this with me in person, I have time this week."
          onBook={onBook}
          onDismiss={() => {}}
        />
      </div>
      <div className={styles.ask}>
        <p className={styles.askText}>{ask}</p>
        <InlineChoicePills
          label="What’s next"
          options={[LEARN_GOLD, second]}
          onPick={(option) => {
            if (option === LEARN_GOLD) onLearnGold?.();
            else if (option === VISIT_NOTES) onVisitNotes?.();
            else onFollowUp?.();
          }}
        />
      </div>
    </div>
  );
}
