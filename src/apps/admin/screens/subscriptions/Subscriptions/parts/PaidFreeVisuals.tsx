/** Free vs paid users on the Total users card: each group's label over its figure, in its colour. */
import { count } from '@shared/admin';
import styles from './PaidFreeVisuals.module.css';

/** `paidLabel`: "Paid", or the plan type picked in the filter (e.g. "Family"). */
export function PaidFreeSplit({ paid, free, paidLabel = 'Paid' }: { paid: number; free: number; paidLabel?: string }) {
  const paidPct = Math.round((paid / (paid + free || 1)) * 100);
  const rows = [
    { key: 'paid', label: `${paidLabel} (${paidPct}%)`, value: paid },
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
