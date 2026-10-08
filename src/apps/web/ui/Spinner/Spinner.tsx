/** @ui Spinner — rotating ring (no dots, no pulse). Decorative unless `label` is given. @xref mobile: apps/mobile/ui/Spinner */
import type { CSSProperties } from 'react';
import { cx } from '@shared/utils';
import styles from './Spinner.module.css';

export interface SpinnerProps {
  size?: number;
  /** When set, the spinner announces itself as a status. */
  label?: string;
  className?: string;
}

export function Spinner({ size = 16, label, className }: SpinnerProps) {
  return (
    <span
      className={cx(styles.root, className)}
      style={{ '--spinner-size': `${size}px` } as CSSProperties}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
