/**
 * @ui Segmented — glass track that spans its container (design 2026-10-20); segments share the width, optional
 *     leading icon per segment. Selected segment sits on the surface with a hairline and medium text.
 */
import { Icon, type IconName } from '../Icon';
import styles from './Segmented.module.css';

export interface SegmentedProps<T extends string> {
  options: { value: T; label: string; icon?: IconName }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

export function Segmented<T extends string>({ options, value, onChange, label }: SegmentedProps<T>) {
  return (
    <div className={styles.root} role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={o.value === value} className={styles.segment} onClick={() => onChange(o.value)}>
          {o.icon && <Icon name={o.icon} size={16} className={styles.icon} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
