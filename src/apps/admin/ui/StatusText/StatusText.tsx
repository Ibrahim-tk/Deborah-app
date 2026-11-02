/** @ui StatusText — status as tone-coloured text with a small leading dot. Never a pill or badge (CLAUDE.md §8). */
import styles from './StatusText.module.css';

export type StatusTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export function StatusText({ tone = 'neutral', children }: { tone?: StatusTone; children: string }) {
  return (
    <span className={styles.root} data-tone={tone}>
      <span className={styles.dot} aria-hidden />
      {children}
    </span>
  );
}
