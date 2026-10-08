/** @ui ProgressBar — 8 px, purple-100 track, Deborah Purple fill, value written beside it. @xref mobile: apps/mobile/ui/ProgressBar */
import type { CSSProperties } from 'react';
import { cx } from '@shared/utils';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  /** 0–1. */
  value: number;
  /** Accessible name. */
  label: string;
  /** Visible text beside the bar, e.g. "Day 18 of 90". */
  valueText?: string;
  className?: string;
}

export function ProgressBar({ value, label, valueText, className }: ProgressBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={cx(styles.root, className)}>
      <span className={styles.track} role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-valuetext={valueText}>
        <span className={styles.fill} style={{ '--progress': `${pct}%` } as CSSProperties} />
      </span>
      {valueText && <span className={styles.value}>{valueText}</span>}
    </div>
  );
}
