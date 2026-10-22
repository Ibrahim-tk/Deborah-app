/**
 * @pattern HealingPlanCard — Home entry to My Healing Plan.
 * @usedBy  M-2.0 Home · My Health · Widget lab
 * @status  placeholder
 *
 * Shows the newest concern and how many actions are done. Opens the plan.
 */
import { HEALING_PLAN_TITLE, HEALING_PLAN_LOCKED_META, HEALING_PLAN_VIEW_CTA } from '@shared/copy/healingPlan';
import { Icon } from '@web/ui';
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
  const label = total > 0
    ? `${HEALING_PLAN_VIEW_CTA}, ${line}, ${done} of ${total} actions`
    : `${HEALING_PLAN_VIEW_CTA}, ${line}`;
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
      </span>
      {total > 0 && (
        <span className={styles.bottom}>
          <span className={styles.count} aria-hidden>
            {done}<span className={styles.of}>/{total}</span>
          </span>
          {/* Grid packs column-by-column (2 rows); fill order is row-wise. */}
          <span className={styles.dots} aria-hidden>
            {Array.from({ length: total }, (_, i) => {
              const row = i % 2;
              const col = Math.floor(i / 2);
              const cols = Math.ceil(total / 2);
              const rank = row * cols + col;
              return <i key={i} data-on={rank < done || undefined} />;
            })}
          </span>
        </span>
      )}
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
