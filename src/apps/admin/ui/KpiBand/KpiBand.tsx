/** @ui KpiBand — the dashboard's headline figures on one hairline band (not a row of cards).
 *  Large sans numbers (no serif inside cards). Live figures update quietly, with no marker. */
import type React from 'react';
import styles from './KpiBand.module.css';

export interface Kpi {
  label: string;
  value: string;
  note?: string;
  live?: boolean;
  /** Change against the previous equal period, in percent. Plain text, coloured by whether it's good news. */
  trend?: { delta: number; against: string; lowerIsBetter?: boolean };
}

function Trend({ delta, against, lowerIsBetter }: NonNullable<Kpi['trend']>) {
  const flat = Math.abs(delta) < 0.05;
  const good = flat ? undefined : (delta > 0) !== Boolean(lowerIsBetter);
  const arrow = flat ? '→' : delta > 0 ? '↑' : '↓';
  return (
    <dd className={styles.trend}>
      <span className={styles.delta} data-good={good}>{arrow} {Math.abs(delta).toFixed(1)}%</span> vs {against}
    </dd>
  );
}

/** `compact`: secondary numbers — smaller figures and less padding, so they don't compete with the main band. */
export function KpiBand({ items, compact }: { items: Kpi[]; compact?: boolean }) {
  return (
    <div className={styles.wrap}>
    <dl className={styles.root} data-compact={compact || undefined} style={{ '--cols': items.length } as React.CSSProperties}>
      {items.map((k) => (
        <div key={k.label} className={styles.cell}>
          <dt className={styles.label}>
            {k.label}
          </dt>
          <dd className={styles.value}>{k.value}</dd>
          {k.trend && <Trend {...k.trend} />}
          {k.note && <dd className={styles.note}>{k.note}</dd>}
        </div>
      ))}
    </dl>
    </div>
  );
}
