/**
 * Home intake V2 cards. New: "Build your health profile · under a minute" with a ring (opens the
 * profile card on its own, M-2.10). Returning: "Complete your profile" with the deferred fields,
 * each a one-tap question (M-2.11); medical documents go through the account gate.
 */
import { Icon, ProgressRing } from '@mobile/ui';
import styles from './HomeCards.module.css';

export function BuildProfileCard({ progress, onOpen }: { progress: number; onOpen: () => void }) {
  return (
    <button type="button" className={`${styles.card} ${styles.lilac}`} onClick={onOpen}>
      <ProgressRing value={progress} label="Health profile complete" />
      <span className={styles.text}>
        <span className={styles.title}>Build your health profile</span>
        <span className={styles.meta}>Under a minute</span>
      </span>
      <Icon name="chevron" size={18} className={styles.chev} />
    </button>
  );
}

export interface DeferredItem {
  key: string;
  label: string;
  onOpen: () => void;
}

export function CompleteProfileCard({ items, progress }: { items: DeferredItem[]; progress: number }) {
  if (!items.length) return null;
  return (
    <section className={`${styles.panel} ${styles.linen}`} aria-labelledby="complete-profile">
      <header className={styles.panelHead}>
        <ProgressRing value={progress} size={36} showValue={false} label="Profile completion" />
        <h2 id="complete-profile" className={styles.title}>Complete your profile</h2>
      </header>
      <ul className={styles.rows}>
        {items.map((it) => (
          <li key={it.key}>
            <button type="button" className={styles.row} onClick={it.onOpen}>
              <span>{it.label}</span>
              <Icon name="chevron" size={18} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
