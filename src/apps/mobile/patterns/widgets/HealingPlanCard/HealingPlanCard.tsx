/**
 * @pattern HealingPlanCard — Home entry to My Healing Plan (renamed from 90 Day Journey).
 * @usedBy  M-2.0 Home · Widget lab
 * @status  placeholder
 */
import { HEALING_PLAN_LOCKED_META, HEALING_PLAN_TITLE, HEALING_PLAN_VIEW_CTA } from '@shared/copy/healingPlan';
import { Icon } from '@mobile/ui';
import styles from './HealingPlanCard.module.css';

export interface HealingPlanCardProps {
  locked?: boolean;
  day?: number;
  totalDays?: number;
  focus?: string;
  todayHabit?: string;
  onPress?: () => void;
}

export function HealingPlanCard({
  locked = false,
  day = 0,
  totalDays = 90,
  focus,
  todayHabit,
  onPress,
}: HealingPlanCardProps) {
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

  // Dot track (design 2026-10-21): 3 rows × 15, so each dot is two days; the current one in the accent.
  const DAYS_PER_DOT = 2;
  const dots = Math.ceil(totalDays / DAYS_PER_DOT);
  const done = Math.min(dots, Math.floor(Math.max(0, day - 1) / DAYS_PER_DOT));
  const line = todayHabit ? `Today: ${todayHabit}` : focus ?? 'One small habit a day';
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
      <span className={styles.bottom}>
        <span className={styles.count} aria-label={`Day ${day} of ${totalDays}`}>
          {day}<span className={styles.of}>/{totalDays}</span>
          <span className={styles.unit}>days</span>
        </span>
        <span className={styles.dots} aria-hidden>
          {Array.from({ length: dots }, (_, i) => (
            <i key={i} data-on={i < done || undefined} data-now={i === done || undefined} />
          ))}
        </span>
      </span>
    </>
  );
  return onPress ? (
    <button type="button" className={`${styles.root} ${styles.plan}`} data-placeholder onClick={onPress} aria-label={`${HEALING_PLAN_VIEW_CTA}, day ${day} of ${totalDays}`}>
      {body}
    </button>
  ) : (
    <section className={`${styles.root} ${styles.plan}`} data-placeholder aria-labelledby="healing-plan-title">{body}</section>
  );
}
