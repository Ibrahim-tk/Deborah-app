/** @ui ProgressRing — small circular progress (0–1) with the percentage read out; the arc animates. */
import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@shared/utils';
import styles from './ProgressRing.module.css';

export interface ProgressRingProps {
  value: number;
  size?: number;
  label: string;
  /** Show the percentage inside the ring. */
  showValue?: boolean;
  className?: string;
  /** Centre content (e.g. an icon) in place of the percentage. */
  children?: ReactNode;
}

export function ProgressRing({ value, size = 44, label, showValue = true, className, children }: ProgressRingProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <span
      className={cx(styles.root, className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      style={{ '--ring-size': `${size}px`, '--ring-value': pct } as CSSProperties}
    >
      <svg className={styles.ring} viewBox="0 0 36 36" aria-hidden>
        <circle className={styles.track} cx="18" cy="18" r="15.9155" />
        <circle className={styles.arc} cx="18" cy="18" r="15.9155" pathLength={100} />
      </svg>
      {children ?? (showValue && <span className={styles.value} aria-hidden>{pct}%</span>)}
    </span>
  );
}
