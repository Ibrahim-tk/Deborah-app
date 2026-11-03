/** @ui StatusText — status as a soft, fully rounded pill: tint ground, tone ink, no dot.
 *  Admin-only exception to the no-pills rule (CLAUDE.md §8), requested by the designer 2026-11-02. */
import styles from './StatusText.module.css';

export type StatusTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export function StatusText({ tone = 'neutral', children }: { tone?: StatusTone; children: string }) {
  return (
    <span className={styles.root} data-tone={tone}>
      {children}
    </span>
  );
}
