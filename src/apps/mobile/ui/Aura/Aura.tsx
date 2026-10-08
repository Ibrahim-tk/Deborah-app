/**
 * @ui Aura — soft, slowly drifting brand gradient (lilac · purple · gold) that melts into the
 * canvas toward the bottom. Decorative backdrop for Splash (M-1.1) and Welcome (M-1.2).
 * Motion is a very slow drift (no pulse/wave) and stops under reduced motion.
 */
import { cx } from '@shared/utils';
import styles from './Aura.module.css';

export interface AuraProps {
  /** Share of the screen the colour occupies before fading to canvas (0–1). */
  reach?: number;
  className?: string;
}

export function Aura({ reach = 0.6, className }: AuraProps) {
  return (
    <span className={cx(styles.root, className)} style={{ '--aura-reach': `${reach * 100}%` } as React.CSSProperties} aria-hidden>
      <span className={cx(styles.blob, styles.a)} />
      <span className={cx(styles.blob, styles.b)} />
      <span className={cx(styles.blob, styles.c)} />
      <span className={cx(styles.blob, styles.d)} />
      <span className={cx(styles.blob, styles.e)} />
      <span className={styles.fade} />
    </span>
  );
}
