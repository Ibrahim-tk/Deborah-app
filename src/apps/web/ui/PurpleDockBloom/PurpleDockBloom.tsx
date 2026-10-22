/**
 * @ui PurpleDockBloom — progressive purple blur/glow rising from the dock (Skiper41 / Home landing).
 * Floating chrome only; place under ChatLauncher, pointer-events none.
 */
import { cx } from '@shared/utils';
import styles from './PurpleDockBloom.module.css';

export function PurpleDockBloom({ className }: { className?: string }) {
  return (
    <div className={cx(styles.root, className)} aria-hidden>
      <span className={styles.glow} />
      <span className={styles.blurStrong} />
      <span className={styles.blurSoft} />
      <span className={styles.veil} />
    </div>
  );
}
