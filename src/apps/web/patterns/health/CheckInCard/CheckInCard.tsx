/**
 * @pattern CheckInCard — next check-in with Deborah: scheduled ("in {n} days") · due ("Due today" +
 *          Check in now) · reminders off ("Turn on check-in reminders") · optional upcoming booking line
 * @usedBy  M-7.2
 * @spec    docs/ux/F07-my-health-hub.md#m-72--my-health-hub (Layout 4)
 * @xref    web: apps/web/patterns/health/CheckInCard — not built
 */
import { Button, Card, Icon } from '@web/ui';
import styles from './CheckInCard.module.css';

export type CheckInCardState =
  | { kind: 'due' }
  | { kind: 'scheduled'; daysUntil: number }
  | { kind: 'unscheduled' }
  | { kind: 'off' };

export interface CheckInCardProps {
  state: CheckInCardState;
  /** "Tuesday, Oct 28 · 10:00 AM" — shown as "Upcoming: consult with Deborah · …". */
  upcoming?: string;
  /** Due: start the check-in. */
  onCheckIn: () => void;
  /** Scheduled / unscheduled / off: open reminder settings. */
  onReminders: () => void;
}

const when = (n: number) => (n <= 0 ? 'later today' : n === 1 ? 'tomorrow' : `in ${n} days`);

function lines(state: Exclude<CheckInCardState, { kind: 'due' }>): { title: string; meta: string } {
  if (state.kind === 'scheduled') return { title: `Next check-in with the Oracle: ${when(state.daysUntil)}`, meta: 'Change when she checks in' };
  if (state.kind === 'unscheduled') return { title: 'No check-in scheduled', meta: 'Choose when the Oracle checks in' };
  return { title: 'Turn on check-in reminders', meta: 'The Oracle can remind you to tell her how you’re doing' };
}

export function CheckInCard({ state, upcoming, onCheckIn, onReminders }: CheckInCardProps) {
  const upcomingLine = upcoming && <span className={styles.upcoming}>Upcoming: consultation · {upcoming}</span>;

  if (state.kind === 'due') {
    return (
      <Card tone="emphasis" className={styles.root}>
        <span className={styles.icon}><Icon name="calendar" size={22} /></span>
        <span className={styles.text}>
          {/* Hierarchy (design 2026-10-20): what it is leads, when sits under it, then the action. */}
          <span className={styles.title}>Check in with the Oracle</span>
          <span className={styles.meta}><span className={styles.due}>Due today</span> · about 2 minutes</span>
        </span>
        <Button fullWidth onClick={onCheckIn} className={styles.action}>Check in now</Button>
        {upcomingLine}
      </Card>
    );
  }

  const { title, meta } = lines(state);
  return (
    <Card onPress={onReminders} className={styles.root}>
      <span className={styles.icon}><Icon name="calendar" size={22} /></span>
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.meta}>{meta}</span>
      </span>
      <Icon name="chevron" size={22} className={styles.chevron} />
      {upcomingLine}
    </Card>
  );
}
