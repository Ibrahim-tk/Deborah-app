/** Home (new user): the 90 Day Journey as a locked preview, and Family as a small row. */
import { Icon } from '@mobile/ui';
import styles from './HomeCards.module.css';

export function JourneyPreview() {
  return (
    <section className={`${styles.card} ${styles.rose}`} aria-label="90 Day Journey, locked">
      <span className={styles.lock} aria-hidden>
        <Icon name="lock" size={20} />
      </span>
      <span className={styles.text}>
        <span className={styles.title}>90 Day Journey</span>
        <span className={styles.meta}>Unlocks after your first conversation</span>
      </span>
    </section>
  );
}

export function FamilyRow({ onAdd }: { onAdd: () => void }) {
  return (
    <button type="button" className={styles.smallRow} onClick={onAdd}>
      <Icon name="family" size={20} />
      <span>Add a family member</span>
      <Icon name="chevron" size={18} className={styles.chev} />
    </button>
  );
}
