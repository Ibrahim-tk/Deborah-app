/** @ui KeyValueList — label / value pairs in a two-column grid that stacks when narrow. */
import type { ReactNode } from 'react';
import styles from './KeyValueList.module.css';

/** `half`: label and value each take half the width, for long reference lists. */
export function KeyValueList({ items, split }: { items: { label: string; value: ReactNode }[]; split?: 'half' }) {
  return (
    <dl className={styles.root} data-split={split}>
      {items.map((it) => (
        <div key={it.label} className={styles.row}>
          <dt className={styles.label}>{it.label}</dt>
          <dd className={styles.value}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
