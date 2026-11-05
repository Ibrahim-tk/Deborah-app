/** Compact stat card for Subscriptions: label, big figure and trend on the left, small detail figures (or a
 *  compact visual) on the right; the card's chart underneath. */
import type { ReactNode } from 'react';
import styles from './KpiCard.module.css';

interface KpiCardProps {
  label: string;
  value: string;
  /** Change against the previous equal period, in percent; omitted when there's nothing to compare. */
  trend?: { delta: number; against: string };
  note?: ReactNode;
  /** Trailing side of the header: detail figures or a compact visual. */
  aside?: ReactNode;
  /** `split`: two columns, header and children down the left, the aside filling the right. */
  layout?: 'stack' | 'split';
  children: ReactNode;
}

export function KpiCard({ label, value, trend, note, aside, layout = 'stack', children }: KpiCardProps) {
  if (layout === 'split') {
    return (
      <section className={styles.split} aria-label={label}>
        <div className={styles.left}>
          <Head label={label} value={value} trend={trend} note={note} />
          <div className={styles.body}>{children}</div>
        </div>
        {aside && <div className={styles.right}>{aside}</div>}
      </section>
    );
  }
  return (
    <section className={styles.card} aria-label={label}>
      <header className={styles.head}>
        <Head label={label} value={value} trend={trend} note={note} />
        {aside && <div className={styles.aside}>{aside}</div>}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

/** Small label/value pairs for a card's aside. */
export function MiniStats({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className={styles.mini}>
      {items.map((d) => (
        <div key={d.label}>
          <dt>{d.label}</dt>
          <dd>{d.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Head({ label, value, trend, note }: Pick<KpiCardProps, 'label' | 'value' | 'trend' | 'note'>) {
  return (
    <div className={styles.text}>
      <h2 className={styles.label}>{label}</h2>
      <p className={styles.value}>{value}</p>
      {trend && (
        <p className={styles.trend}>
          <span className={styles.delta} data-good={trend.delta >= 0}>{trend.delta >= 0 ? '↑' : '↓'} {Math.abs(trend.delta).toFixed(1)}%</span> vs {trend.against}
        </p>
      )}
      {note && <p className={styles.note}>{note}</p>}
    </div>
  );
}
