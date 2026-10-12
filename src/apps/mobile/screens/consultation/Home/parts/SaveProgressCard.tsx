/**
 * Home "Save your progress with Deborah" (design direction 2026-10-12): a slim card for guests after
 * their first chat. Dismissible; it comes back after the next consultation. Never before the first
 * chat — then the avatar dot is the only ask.
 */
import { Button, Icon } from '@mobile/ui';
import styles from './SaveProgressCard.module.css';

export function SaveProgressCard({ onSave, onDismiss }: { onSave: () => void; onDismiss: () => void }) {
  return (
    <section className={styles.root} aria-labelledby="save-progress-title">
      <p id="save-progress-title" className={styles.text}>Save your progress with Deborah</p>
      <Button size="md" onClick={onSave}>Save</Button>
      <button type="button" className={styles.close} aria-label="Dismiss" onClick={onDismiss}>
        <Icon name="close" size={18} />
      </button>
    </section>
  );
}
