/** @ui BarChart — vertical bars over time (SVG) or horizontal ranked bars (HTML rows, labels lead). */
import type { CSSProperties } from 'react';
import { niceMax } from '../chartScale';
import styles from './BarChart.module.css';

export interface BarDatum {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarDatum[];
  label: string;
  orientation?: 'vertical' | 'horizontal';
}

const W = 640, H = 240, PAD = { t: 12, r: 8, b: 28, l: 40 };

export function BarChart({ data, label, orientation = 'vertical' }: BarChartProps) {
  const max = niceMax(Math.max(...data.map((d) => d.value)));

  if (orientation === 'horizontal') {
    return (
      <ol className={styles.rows} aria-label={label}>
        {data.map((d) => (
          <li key={d.label} className={styles.row}>
            <span className={styles.rowLabel}>{d.label}</span>
            <span className={styles.track}>
              <span className={styles.fill} style={{ '--w': `${(d.value / max) * 100}%` } as CSSProperties} />
            </span>
            <span className={styles.rowValue}>{d.value.toLocaleString('en-US')}</span>
          </li>
        ))}
      </ol>
    );
  }

  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const slot = iw / data.length, bw = Math.min(28, slot * 0.6);
  const y = (v: number) => PAD.t + ih - (v / max) * ih;
  // Every label up to 14 bars; thinned beyond that so they never collide.
  const every = Math.ceil(data.length / 14);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label={label}>
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(max * f)} y2={y(max * f)} className={styles.grid} />
          <text x={PAD.l - 8} y={y(max * f)} className={styles.tick} textAnchor="end" dominantBaseline="middle">{Math.round(max * f)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const cx = PAD.l + slot * i + slot / 2;
        return (
          <g key={d.label}>
            <rect x={cx - bw / 2} y={y(d.value)} width={bw} height={PAD.t + ih - y(d.value)} rx={3} className={styles.bar}>
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
            {i % every === 0 && <text x={cx} y={H - 8} className={styles.tick} textAnchor="middle">{d.label}</text>}
          </g>
        );
      })}
    </svg>
  );
}
