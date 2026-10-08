/**
 * @pattern PlanProgressCard — "Your 90-day plan · Day {n} of 90" · thin progress bar · habits this
 *          week; complete state (day > 90) invites telling Deborah how it went
 * @usedBy  M-7.2
 * @spec    docs/ux/F07-my-health-hub.md#m-72--my-health-hub (Layout 3, plan complete state)
 * @xref    web: apps/web/patterns/health/PlanProgressCard — not built
 */
import { Card, Icon, ProgressBar } from '@mobile/ui';
import styles from './PlanProgressCard.module.css';

export interface PlanProgressCardProps {
  /** Day n on the simulated clock; may exceed `length`. */
  day: number;
  length?: number;
  habitsDone: number;
  habitsTotal: number;
  onPress: () => void;
}

export function PlanProgressCard({ day, length = 90, habitsDone, habitsTotal, onPress }: PlanProgressCardProps) {
  const complete = day > length;
  return (
    <Card onPress={onPress} className={styles.root}>
      <span className={styles.head}>
        <span className={styles.title}>Your {length}-day plan</span>
        <Icon name="chevron" size={22} className={styles.chevron} />
      </span>
      {complete ? (
        <span className={styles.complete}>You finished your {length} days — tell Deborah how it went</span>
      ) : (
        <>
          <ProgressBar value={day / length} label={`${length}-day plan progress`} valueText={`Day ${day} of ${length}`} />
          <span className={styles.meta}>
            {habitsTotal > 0 ? `${habitsDone} of ${habitsTotal} habits this week` : 'No habits on your plan yet'}
          </span>
        </>
      )}
    </Card>
  );
}
