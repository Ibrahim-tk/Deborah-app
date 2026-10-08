/**
 * @ui ScrollEdge — iOS 26 "scroll edge effect" under a floating glass nav bar: a progressive blur
 * plus a soft canvas fade that appears only once content scrolls beneath the bar.
 * Place it inside a positioned screen root, before the floating controls.
 */
import { cx } from '@shared/utils';
import styles from './ScrollEdge.module.css';

export interface ScrollEdgeProps {
  /** True once the scroll container has moved (content is under the bar). */
  active: boolean;
  className?: string;
}

export function ScrollEdge({ active, className }: ScrollEdgeProps) {
  return (
    <div className={cx(styles.root, className)} data-active={active || undefined} aria-hidden>
      <span className={styles.blurStrong} />
      <span className={styles.blurSoft} />
      <span className={styles.fade} />
    </div>
  );
}
