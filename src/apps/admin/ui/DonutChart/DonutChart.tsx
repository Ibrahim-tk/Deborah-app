/** @ui DonutChart — share of a whole, total in the centre, legend with counts and percentages beside it. */
import styles from './DonutChart.module.css';

export type DonutTone = 'accent' | 'gold' | 'success' | 'danger' | 'muted';

export interface DonutSlice {
  label: string;
  value: number;
  tone: DonutTone;
}

const R = 52, C = 2 * Math.PI * R;

export function DonutChart({ data, label, totalLabel }: { data: DonutSlice[]; label: string; totalLabel: string }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  return (
    <div className={styles.wrap}>
    <div className={styles.root}>
      <svg viewBox="0 0 140 140" className={styles.svg} role="img" aria-label={label}>
        <circle cx={70} cy={70} r={R} className={styles.base} />
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
              strokeDasharray={`${Math.max(len - 2, 0)} ${C}`}
              strokeDashoffset={-offset}
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </circle>
          );
          offset += len;
          return el;
        })}
        <text x={70} y={68} textAnchor="middle" className={styles.total}>{total.toLocaleString('en-US')}</text>
        <text x={70} y={88} textAnchor="middle" className={styles.totalLabel}>{totalLabel}</text>
      </svg>
      <ul className={styles.legend}>
        {data.map((d) => (
          <li key={d.label} className={styles.item} data-tone={d.tone}>
            <span className={styles.name}>{d.label}</span>
            <span className={styles.value}>{d.value.toLocaleString('en-US')}</span>
            <span className={styles.pct}>{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}
