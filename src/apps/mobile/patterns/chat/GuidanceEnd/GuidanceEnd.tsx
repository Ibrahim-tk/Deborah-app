/**
 * @pattern GuidanceEnd — two stacked choices at the end of the guidance framework: keep talking, or back to
 *          Home (design 2026-10-26; mobile: no divider, vertical, 2026-10-28).
 * @usedBy  M-2.1 Conversation (after the after-guidance trail)
 */
import { Button } from '@mobile/ui';
import styles from './GuidanceEnd.module.css';

export interface GuidanceEndProps {
  onHome: () => void;
  onContinue: () => void;
}

export function GuidanceEnd({ onHome, onContinue }: GuidanceEndProps) {
  return (
    <section className={styles.root} aria-label="End of guidance">
      {/* Mobile (designer, 2026-10-28): no divider; stacked, primary on top. */}
      <div className={styles.actions}>
        <Button fullWidth onClick={onContinue}>Continue conversation</Button>
        <Button variant="secondary" fullWidth onClick={onHome}>Back to Home</Button>
      </div>
    </section>
  );
}
