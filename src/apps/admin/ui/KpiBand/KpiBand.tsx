/** @ui KpiBand — the dashboard's headline figures on one hairline band (not a row of cards).
 *  Large serif numbers; an optional live marker shows the figure is updating. */
import styles from './KpiBand.module.css';

export interface Kpi {
  label: string;
  value: string;
  note?: string;
  live?: boolean;
}

export function KpiBand({ items }: { items: Kpi[] }) {
  return (
    <div className={styles.wrap}>
    <dl className={styles.root}>
      {items.map((k) => (
        <div key={k.label} className={styles.cell}>
          <dt className={styles.label}>
            {k.label}
            {k.live && <span className={styles.live} title="Updates live" aria-label="updates live" />}
          </dt>
          <dd className={styles.value}>{k.value}</dd>
          {k.note && <dd className={styles.note}>{k.note}</dd>}
        </div>
      ))}
    </dl>
    </div>
  );
}
