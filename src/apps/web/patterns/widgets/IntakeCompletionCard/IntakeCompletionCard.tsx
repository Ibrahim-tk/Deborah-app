/**
 * @pattern IntakeCompletionCard — Home entry to finish / update intake.
 * @usedBy  M-2.0 Home · Widget lab · Design system
 * @status  placeholder
 */
import { Button, Icon, IconButton, ProgressRing } from '@web/ui';
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
  /** Stack only: shows a close button that hides the card. */
  onDismiss?: () => void;
}

export function IntakeCompletionCard({
  progress,
  onAction,
  complete = false,
  title,
  body,
  layout = 'row',
  onDismiss,
}: IntakeCompletionCardProps) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const heading = title ?? (complete ? 'Update your intake' : 'Complete your intake');
  const copy =
    body
    ?? (complete
      ? 'Your profile is saved. Refresh it anytime as things change.'
      : 'A few quiet details so the Oracle can tailor its guidance to you.');

  if (layout === 'stack') {
    // Card copy per docs/copy/voice-tone-ux-copy.md; gradient wash instead of the reference's flower graphic.
    const stackTitle = title ?? (complete ? 'Your health profile' : 'Complete your health profile');
    const stackBody =
      body
      ?? (complete
        ? 'The details you’ve shared, all in one place.'
        : 'A few details about your health help me tailor my guidance to you.');
    const status = `${pct}%`;
    return (
      <section className={styles.stack} aria-labelledby="intake-completion-title" data-placeholder>
        {onDismiss && <IconButton icon="close" size="sm" label="Dismiss" className={styles.close} onClick={onDismiss} />}
        <span className={styles.copy}>
          <h3 id="intake-completion-title" className={styles.stackTitle}>{stackTitle}</h3>
          <span className={styles.stackBody}>{stackBody}</span>
        </span>
        <span className={styles.meter}>
          <span className={styles.meterRow}>
            <span className={styles.meterLabel}>Your health profile</span>
            <span className={styles.meterStatus}>{status}</span>
          </span>
          <span
            className={styles.track}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Health profile completion"
          >
            <span className={styles.fill} style={{ '--progress': pct / 100 } as React.CSSProperties} />
          </span>
        </span>
        <Button size="lg" fullWidth onClick={onAction}>
          {complete ? 'Review profile' : pct === 0 ? 'Let’s begin' : 'Continue'}
        </Button>
      </section>
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
