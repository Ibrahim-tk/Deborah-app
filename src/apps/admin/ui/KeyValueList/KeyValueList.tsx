/** @ui KeyValueList — label / value pairs in a two-column grid that stacks when narrow. */
import type { ReactNode } from 'react';
import styles from './KeyValueList.module.css';

export function KeyValueList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className={styles.root}>
      {items.map((it) => (
        <div key={it.label} className={styles.row}>
          <dt className={styles.label}>{it.label}</dt>
          <dd className={styles.value}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
