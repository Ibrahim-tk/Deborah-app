/** One-tap shortcuts above the table. Single choice: tapping the active one turns it off. */
import { Icon } from '@admin/ui';
import type { QuickFilter } from '../types';
import styles from '../TableFilters.module.css';

export function QuickFilters({ items, value, onChange }: { items: QuickFilter[]; value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div className={styles.quick} role="group" aria-label="Quick filters">
      {items.map((q) => {
        const on = value === q.key;
        return (
          <button key={q.key} type="button" className={styles.quickBtn} aria-pressed={on} onClick={() => onChange(on ? null : q.key)}>
            {on && <Icon name="check" size={16} />}
            {q.label}
          </button>
        );
      })}
    </div>
  );
}
