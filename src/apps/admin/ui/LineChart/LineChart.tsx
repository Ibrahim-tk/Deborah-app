/** @ui LineChart — one or two series over shared labels. SVG scales to its container; values in <title> on each point. */
import { niceMax } from '../chartScale';
import styles from './LineChart.module.css';

export interface LineSeries {
  name: string;
  values: number[];
  tone?: 'accent' | 'gold' | 'success' | 'danger';
}

const W = 640, PAD = { t: 12, r: 12, b: 28, l: 40 };

/** `height`: drawing height in chart units (default 240 at 640 wide); lower it for a flatter chart in compact cards. */
export function LineChart({ labels, series, label, height: H = 240 }: { labels: string[]; series: LineSeries[]; label: string; height?: number }) {
  const max = niceMax(Math.max(...series.flatMap((s) => s.values)));
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const x = (i: number) => PAD.l + (labels.length < 2 ? iw / 2 : (i / (labels.length - 1)) * iw);
  const y = (v: number) => PAD.t + ih - (v / max) * ih;
  const ticks = (H < 200 ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1]).map((f) => Math.round(max * f));
  const every = Math.ceil(labels.length / 7);

  return (
    <figure className={styles.root}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label={label}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className={styles.grid} />
            <text x={PAD.l - 8} y={y(t)} className={styles.tick} textAnchor="end" dominantBaseline="middle">{t}</text>
          </g>
        ))}
        {labels.map((l, i) =>
          i % every === 0 ? <text key={l} x={x(i)} y={H - 8} className={styles.tick} textAnchor="middle">{l}</text> : null,
        )}
        {series.map((s) => (
          <g key={s.name} className={styles.series} data-tone={s.tone ?? 'accent'}>
            <polyline points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} className={styles.line} />
            {s.values.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r={3.5} className={styles.point}>
                <title>{`${s.name}, ${labels[i]}: ${v}`}</title>
              </circle>
            ))}
          </g>
        ))}
      </svg>
      {series.length > 1 && (
        <figcaption className={styles.legend}>
          {series.map((s) => (
            <span key={s.name} className={styles.key} data-tone={s.tone ?? 'accent'}>{s.name}</span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
