/** @ui DonutChart — share of a whole, total in the centre, legend with counts and percentages beside it. */
import styles from './DonutChart.module.css';

export type DonutTone = 'accent' | 'gold' | 'success' | 'danger' | 'info' | 'muted';

export interface DonutSlice {
  label: string;
  value: number;
  tone: DonutTone;
}

const R = 52, C = 2 * Math.PI * R;
/** Round caps reach half the stroke past each dash end, so each slice is shortened by a full stroke plus a small gap. */
const STROKE = 11, GAP = 4;

/** `legend={false}`: just the ring, for layouts that list the slices elsewhere. */
/** `centerValue`: show a figure other than the sum in the middle (e.g. the highlighted slice when a filter is on). */
export function DonutChart({ data, label, totalLabel, legend = true, centerValue }: { data: DonutSlice[]; label: string; totalLabel: string; legend?: boolean; centerValue?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  return (
    <div className={styles.wrap}>
    <div className={styles.root} data-legend={legend || undefined}>
      <svg viewBox="0 0 140 140" className={styles.svg} role="img" aria-label={label}>
        {data.map((d) => {
          const len = (d.value / total) * C;
          const el = (
            <circle
              key={d.label}
              cx={70}
              cy={70}
              r={R}
              className={styles.slice}
              data-tone={d.tone}
              strokeDasharray={`${Math.max(len - STROKE - GAP, 0.01)} ${C}`}
              strokeDashoffset={-(offset + (STROKE + GAP) / 2)}
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </circle>
          );
          offset += len;
          return el;
        })}
        <text x={70} y={68} textAnchor="middle" className={styles.total}>{(centerValue ?? total).toLocaleString('en-US')}</text>
        <text x={70} y={88} textAnchor="middle" className={styles.totalLabel}>{totalLabel}</text>
      </svg>
      {legend && (
      <ul className={styles.legend}>
        {data.map((d) => (
          <li key={d.label} className={styles.item} data-tone={d.tone}>
            <span className={styles.name}>{d.label}</span>
            <span className={styles.value}>{d.value.toLocaleString('en-US')}</span>
            <span className={styles.pct}>{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
      )}
    </div>
    </div>
  );
}
