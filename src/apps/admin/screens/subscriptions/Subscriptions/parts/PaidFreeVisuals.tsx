/** Free vs paid users on the Total users card: each group's label over its figure, in its colour. */
import { count } from '@shared/admin';
import styles from './PaidFreeVisuals.module.css';

export function PaidFreeSplit({ paid, free }: { paid: number; free: number }) {
  const paidPct = Math.round((paid / (paid + free || 1)) * 100);
  const rows = [
    { key: 'paid', label: `Paid (${paidPct}%)`, value: paid },
    { key: 'free', label: `Free (${100 - paidPct}%)`, value: free },
  ];
  return (
    <dl className={styles.figures}>
      {rows.map((r) => (
        <div key={r.key} data-tone={r.key}>
          <dt>{r.label}</dt>
          <dd>{count(r.value)}</dd>
        </div>
      ))}
    </dl>
  );
}
