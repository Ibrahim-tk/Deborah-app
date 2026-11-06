/**
 * Readable control for the inner orbit: the person's symptoms as tappable pills under the wheel.
 * Tap one to trace it (its areas light up on the wheel). "+N" opens the list view.
 */
import { cx } from '@shared/utils';
import type { SymptomSatellite } from '@shared/engine';
import styles from './TraceBar.module.css';

interface Props {
  satellites: SymptomSatellite[];
  overflow: number;
  trace: string | null;
  onTrace: (label: string | null) => void;
  onMore: () => void;
}

export function TraceBar({ satellites, overflow, trace, onTrace, onMore }: Props) {
  return (
    <section className={styles.root} aria-label="Your symptoms">
      <p className={styles.heading}>Your Symptoms</p>
      <ul className={styles.chips}>
        {satellites.map((s) => (
          <li key={s.label}>
            <button
              type="button"
              className={cx(styles.chip, trace === s.label && styles.on)}
              aria-pressed={trace === s.label}
              onClick={() => onTrace(trace === s.label ? null : s.label)}
            >
              {s.label}
            </button>
          </li>
        ))}
        {overflow > 0 && (
          <li>
            <button type="button" className={cx(styles.chip, styles.more)} onClick={onMore}>+{overflow} more</button>
          </li>
        )}
      </ul>
    </section>
  );
}
