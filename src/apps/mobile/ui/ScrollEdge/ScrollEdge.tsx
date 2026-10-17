/**
 * @ui ScrollEdge — iOS 26 "scroll edge effect" under a floating glass nav bar: a progressive blur
 * plus a soft canvas fade. Use `soft` for a whisper at rest; `active` strengthens when content
 * scrolls beneath the bar.
 */
import { cx } from '@shared/utils';
import styles from './ScrollEdge.module.css';

export interface ScrollEdgeProps {
  /** True once the scroll container has moved (content is under the bar). */
  active: boolean;
  /** Keep a light feather even at rest so the nav never hard-cuts the backdrop. */
  soft?: boolean;
  className?: string;
}

export function ScrollEdge({ active, soft, className }: ScrollEdgeProps) {
  return (
    <div
      className={cx(styles.root, className)}
      data-active={active || undefined}
      data-soft={soft || undefined}
      aria-hidden
    >
      <span className={styles.blurStrong} />
      <span className={styles.blurSoft} />
      <span className={styles.fade} />
    </div>
  );
}
