/**
 * @pattern IntakeCompletionCard — Home health-profile progress + Complete/Update Intake CTA.
 * @usedBy  M-2.0 Home · Widget lab · Design system
 * @status  placeholder
 */
import { Button, ProgressBar } from '@mobile/ui';
import styles from './IntakeCompletionCard.module.css';

export interface IntakeCompletionCardProps {
  /** 0–1 completion fraction. */
  progress: number;
  onAction: () => void;
  /** When true, CTA reads Update Intake. */
  complete?: boolean;
  title?: string;
  body?: string;
}

export function IntakeCompletionCard({
  progress,
  onAction,
  complete = false,
  title,
  body = 'Complete your health information to receive more personalized guidance.',
}: IntakeCompletionCardProps) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const heading = title ?? `Your Health Profile — ${pct}% Complete`;
  return (
    <section className={styles.root} aria-labelledby="intake-completion-title" data-placeholder>
      <h2 id="intake-completion-title" className={styles.title}>
        {heading}
      </h2>
      <ProgressBar value={progress} label={`${pct}% of health profile complete`} />
      <p className={styles.body}>{body}</p>
      <Button fullWidth onClick={onAction}>
        {complete ? 'Update Intake' : 'Complete Intake'}
      </Button>
    </section>
  );
}
