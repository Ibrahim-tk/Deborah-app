/** @ui StatusText — status as a soft, fully rounded pill: tint ground, tone ink, no dot.
 *  Admin-only exception to the no-pills rule (CLAUDE.md §8), requested by the designer 2026-11-02. */
import { Icon, type IconName } from '../Icon';
import styles from './StatusText.module.css';

/** `processing`: blue-tint pill like the others, text then a small blue progress ring showing how far along the work is (`progress`, 0–100). */
export type StatusTone = 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger' | 'processing';

/** `icon`: optional small leading icon, e.g. a person for the Individual plan. */
export function StatusText({ tone = 'neutral', progress = 60, icon, children }: { tone?: StatusTone; progress?: number; icon?: IconName; children: string }) {
  return (
    <span className={styles.root} data-tone={tone}>
      {icon && <Icon name={icon} size={14} />}
      {children}
      {tone === 'processing' && (
        // Thin progress ring with rounded ends: pale track, filled arc from 12 o'clock.
        <svg viewBox="0 0 16 16" className={styles.ring} aria-hidden>
          <circle cx="8" cy="8" r="6" className={styles.track} />
          <circle cx="8" cy="8" r="6" className={styles.arc} pathLength={100} strokeDasharray={`${progress} 100`} transform="rotate(-90 8 8)" />
        </svg>
      )}
    </span>
  );
}
