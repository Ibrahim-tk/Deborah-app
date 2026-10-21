/**
 * @pattern HealingPlanCard — Home entry to My Healing Plan.
 * @usedBy  M-2.0 Home · My Health · Widget lab
 * @status  placeholder
 *
 * Shows the newest concern and how many actions are done. Opens the plan.
 */
import { HEALING_PLAN_TITLE, HEALING_PLAN_LOCKED_META, HEALING_PLAN_VIEW_CTA } from '@shared/copy/healingPlan';
import { Icon } from '@mobile/ui';
import styles from './HealingPlanCard.module.css';

export interface HealingPlanCardProps {
  locked?: boolean;
  /** Newest active concern. */
  concern?: string;
  done?: number;
  total?: number;
  onPress?: () => void;
}

export function HealingPlanCard({ locked = false, concern, done = 0, total = 0, onPress }: HealingPlanCardProps) {
  if (locked) {
    return (
      <section className={styles.root} data-placeholder aria-labelledby="healing-plan-title">
        <div className={styles.head}>
          <span className={styles.icon} aria-hidden>
            <Icon name="lock" size={18} />
          </span>
          <h2 id="healing-plan-title" className={styles.title}>
            {HEALING_PLAN_TITLE}
          </h2>
        </div>
        <p className={styles.meta}>{HEALING_PLAN_LOCKED_META}</p>
      </section>
    );
  }

  const line = concern ?? 'Your plan';
  const progress = total > 0 ? `${done} of ${total} actions` : undefined;
  const label = progress ? `${HEALING_PLAN_VIEW_CTA}, ${line}, ${progress}` : `${HEALING_PLAN_VIEW_CTA}, ${line}`;
  const body = (
    <>
      <span className={styles.top}>
        <span className={styles.icon} aria-hidden>
          <Icon name="calendar" size={20} />
        </span>
        {onPress && (
          <span className={styles.arrow} aria-hidden>
            <Icon name="chevron" size={18} />
          </span>
        )}
      </span>
      <span className={styles.copy}>
        <span id="healing-plan-title" className={styles.title}>{HEALING_PLAN_TITLE}</span>
        <span className={styles.meta}>{line}</span>
        {progress && <span className={styles.progress}>{progress}</span>}
      </span>
    </>
  );
  return onPress ? (
    <button type="button" className={`${styles.root} ${styles.plan}`} data-placeholder onClick={onPress} aria-label={label}>
      {body}
    </button>
  ) : (
    <section className={`${styles.root} ${styles.plan}`} data-placeholder aria-labelledby="healing-plan-title">{body}</section>
  );
}
