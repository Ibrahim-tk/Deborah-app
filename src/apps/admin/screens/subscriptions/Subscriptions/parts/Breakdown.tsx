/** Legend rows for the ring: coloured dot, name, count and share. */
import { count } from '@shared/admin';
import styles from './Breakdown.module.css';

export interface BreakdownRow {
  label: string;
  value: number;
  pct: number;
  tone: 'accent' | 'gold' | 'muted';
}

export function Breakdown({ rows }: { rows: BreakdownRow[] }) {
  return (
    <ul className={styles.rows}>
      {rows.map((r) => (
        <li key={r.label} className={styles.row} data-tone={r.tone}>
          <span className={styles.name}>{r.label}</span>
          <span className={styles.value}>{count(r.value)}</span>
          <span className={styles.pct}>{r.pct}%</span>
        </li>
      ))}
    </ul>
  );
}
