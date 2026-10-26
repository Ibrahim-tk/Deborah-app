/**
 * @pattern GuidanceEnd — hairline marking the end of the guidance framework, then two side-by-side
 *          choices: back to Home, or keep talking (design 2026-10-26).
 * @usedBy  M-2.1 Conversation (after the after-guidance trail)
 */
import { Button } from '@web/ui';
import styles from './GuidanceEnd.module.css';

export interface GuidanceEndProps {
  onHome: () => void;
  onContinue: () => void;
}

export function GuidanceEnd({ onHome, onContinue }: GuidanceEndProps) {
  return (
    <section className={styles.root} aria-label="End of guidance">
      <hr className={styles.rule} />
      <div className={styles.actions}>
        <Button variant="secondary" fullWidth onClick={onHome}>Back to Home</Button>
        <Button fullWidth onClick={onContinue}>Continue conversation</Button>
      </div>
    </section>
  );
}
