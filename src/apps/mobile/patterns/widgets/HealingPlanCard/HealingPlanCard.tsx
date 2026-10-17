/**
 * @pattern HealingPlanCard — Home entry to My Healing Plan (renamed from 90 Day Journey).
 * @usedBy  M-2.0 Home · Widget lab
 * @status  placeholder
 */
import { HEALING_PLAN_LOCKED_META, HEALING_PLAN_TITLE, HEALING_PLAN_VIEW_CTA } from '@shared/copy/healingPlan';
import { Button, Icon, ProgressBar } from '@mobile/ui';
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

  const progress = totalDays > 0 ? Math.min(1, day / totalDays) : 0;
  return (
    <section className={styles.root} data-placeholder aria-labelledby="healing-plan-title">
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden>
          <Icon name="calendar" size={18} />
        </span>
        <h2 id="healing-plan-title" className={styles.title}>
          {HEALING_PLAN_TITLE}
        </h2>
      </div>
      <p className={styles.meta}>
        Day {day} of {totalDays}
        {todayHabit ? ` · Today: ${todayHabit}` : ''}
      </p>
      <ProgressBar value={progress} label={`Day ${day} of ${totalDays}`} />
      {onPress && (
        <Button fullWidth variant="secondary" onClick={onPress}>
          {HEALING_PLAN_VIEW_CTA}
        </Button>
      )}
    </section>
  );
}
