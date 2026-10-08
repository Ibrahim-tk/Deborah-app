/**
 * @pattern TrialCounter — "n free consultations left" as plain subhead text (no pill). At 0 with
 *          `onChoosePlan` it becomes the slim locked hint "Choose a plan to start a new
 *          consultation" (docs/ux/F04-plans-account.md#m-41).
 *          `inline` renders a strip with a small Upgrade button for the Composer banner.
 * @usedBy  M-2.1
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (Layout 4)
 * @xref    web: apps/web/patterns/chat/TrialCounter — not built
 */
import { Button } from '@mobile/ui';
import styles from './TrialCounter.module.css';

export interface TrialCounterProps {
  /** Free consultations left, or null on a paid plan (hidden). */
  left: number | null;
  onChoosePlan?: () => void;
  /** Renders as a one-line strip with a small Upgrade button, for the composer's banner slot. */
  inline?: boolean;
}

export function TrialCounter({ left, onChoosePlan, inline }: TrialCounterProps) {
  if (left === null) return null;
  if (inline) {
    const label = left === 0 ? 'No free consultations left' : `${left} free consultation${left === 1 ? '' : 's'} left`;
    return (
      <div className={styles.inline}>
        <p className={styles.inlineText} aria-live="polite">{label}</p>
        {onChoosePlan && (
          <Button variant="link" size="sm" className={styles.upgrade} onClick={onChoosePlan}>
            Upgrade
          </Button>
        )}
      </div>
    );
  }
  if (left === 0 && onChoosePlan) {
    return (
      <div className={styles.hint}>
        <Button variant="link" size="sm" leadingIcon="lock" onClick={onChoosePlan}>
          Choose a plan to start a new consultation
        </Button>
      </div>
    );
  }
  const text = left === 0 ? 'No free consultations left' : `${left} free consultation${left === 1 ? '' : 's'} left`;
  return <p className={styles.root} aria-live="polite">{text}</p>;
}
