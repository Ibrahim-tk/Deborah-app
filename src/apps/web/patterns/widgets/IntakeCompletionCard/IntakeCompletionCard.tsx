/**
 * @pattern IntakeCompletionCard — Home entry to finish / update intake.
 * @usedBy  M-2.0 Home · Widget lab · Design system
 * @status  placeholder
 */
import { Icon, ProgressRing } from '@web/ui';
import styles from './IntakeCompletionCard.module.css';

export interface IntakeCompletionCardProps {
  /** 0–1 completion fraction. */
  progress: number;
  onAction: () => void;
  /** When true, copy invites an update rather than a first finish. */
  complete?: boolean;
  title?: string;
  body?: string;
  /** `stack`: vertical floating card (web Home, bottom-right) — ring · title · copy · action row. */
  layout?: 'row' | 'stack';
}

export function IntakeCompletionCard({
  progress,
  onAction,
  complete = false,
  title,
  body,
  layout = 'row',
}: IntakeCompletionCardProps) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const heading = title ?? (complete ? 'Update your intake' : 'Complete your intake');
  const copy =
    body
    ?? (complete
      ? 'Your profile is saved. Refresh it anytime as things change.'
      : 'A few quiet details so the Oracle can tailor its guidance to you.');

  if (layout === 'stack') {
    return (
      <button type="button" className={styles.stack} onClick={onAction} aria-labelledby="intake-completion-title" data-placeholder>
        <span className={styles.stackTop}>
          <ProgressRing value={progress} size={64} label={`${pct}% of health profile complete`} />
          <span className={styles.stackStep}>{pct === 0 ? 'About 3 minutes' : `${pct}% done`}</span>
        </span>
        <span className={styles.copy}>
          <span id="intake-completion-title" className={styles.stackTitle}>{heading}</span>
          <span className={styles.body}>{copy}</span>
        </span>
        <span className={styles.stackAction}>
          {pct === 0 ? 'Start now' : 'Continue'}
          <Icon name="chevron" size={16} />
        </span>
      </button>
    );
  }

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
