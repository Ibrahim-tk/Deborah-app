/** @ui Spinner — 16 pt rotating ring (no dots, no pulse). */
import type { CSSProperties } from 'react';
import styles from './Spinner.module.css';

export interface SpinnerProps {
  size?: number;
  label?: string;
}

export function Spinner({ size = 16, label }: SpinnerProps) {
  return (
    <span
      className={styles.root}
      style={{ '--spinner-size': `${size}px` } as CSSProperties}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
