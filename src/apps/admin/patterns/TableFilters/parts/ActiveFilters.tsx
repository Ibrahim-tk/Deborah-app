/** Applied filters as removable chips under the bar, plus Clear all. */
import { Icon } from '@admin/ui';
import styles from '../TableFilters.module.css';

export interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

export function ActiveFilters({ chips, clearLabel, onClear }: { chips: Chip[]; clearLabel: string | null; onClear: () => void }) {
  if (!chips.length && !clearLabel) return null;
  return (
    <div className={styles.chips}>
      {chips.map((c) => (
        <button key={c.key} type="button" className={styles.chip} onClick={c.onRemove} aria-label={`Remove ${c.label}`}>
          {c.label}
          <Icon name="close" size={14} />
        </button>
      ))}
      {clearLabel && <button type="button" className={styles.clear} onClick={onClear}>{clearLabel}</button>}
    </div>
  );
}
