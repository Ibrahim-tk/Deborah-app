/** @ui ProgressBar — 8 pt, purple-100 track, Deborah Purple fill, value written beside it. */
import type { CSSProperties } from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  /** 0–1. */
  value: number;
  label: string;
  valueText?: string;
}

export function ProgressBar({ value, label, valueText }: ProgressBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={styles.root}>
      <span className={styles.track} role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-valuetext={valueText}>
        <span className={styles.fill} style={{ '--progress': `${pct}%` } as CSSProperties} />
      </span>
      {valueText && <span className={styles.value}>{valueText}</span>}
    </div>
  );
}
