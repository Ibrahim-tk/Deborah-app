/**
 * @pattern IntakeCompletionCard — Home entry to finish / update intake.
 * @usedBy  M-2.0 Home · Widget lab · Design system
 * @status  placeholder
 */
import { Icon, ProgressRing } from '@mobile/ui';
import styles from './IntakeCompletionCard.module.css';

export interface IntakeCompletionCardProps {
  /** 0–1 completion fraction. */
  progress: number;
  onAction: () => void;
  /** When true, copy invites an update rather than a first finish. */
  complete?: boolean;
  title?: string;
  body?: string;
}

export function IntakeCompletionCard({
  progress,
  onAction,
  complete = false,
  title,
  body,
}: IntakeCompletionCardProps) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const heading = title ?? (complete ? 'Update your intake' : 'Complete your intake');
  const copy =
    body
    ?? (complete
      ? 'Your profile is saved. Refresh it anytime as things change.'
      : 'A few quiet details so the Oracle can tailor its guidance to you.');

  return (
    <button
      type="button"
      className={styles.root}
      onClick={onAction}
      aria-labelledby="intake-completion-title"
      data-placeholder
    >
      <span className={styles.mark} aria-hidden>
        <Icon name="note" size={20} />
      </span>
      <span className={styles.copy}>
        <span id="intake-completion-title" className={styles.title}>
          {heading}
        </span>
        <span className={styles.body}>{copy}</span>
      </span>
      <ProgressRing
        value={progress}
        size={56}
        label={`${pct}% of health profile complete`}
        className={styles.ring}
      />
    </button>
  );
}
