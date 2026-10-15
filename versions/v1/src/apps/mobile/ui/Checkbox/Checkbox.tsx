/** @ui Checkbox — 26 pt box, whole row tappable; label may contain links (they stop propagation). */
import { useId, type ReactNode } from 'react';
import { Icon } from '../Icon';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
}

export function Checkbox({ checked, onChange, label, description }: CheckboxProps) {
  const id = useId();
  return (
    <div className={styles.root}>
      <input id={id} type="checkbox" className={styles.input} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id} className={styles.row}>
        <span className={styles.box} data-checked={checked} aria-hidden="true">
          {checked && <Icon name="check" size={18} strokeWidth={2} />}
        </span>
        <span className={styles.text}>
          <span className={styles.label}>{label}</span>
          {description && <span className={styles.description}>{description}</span>}
        </span>
      </label>
    </div>
  );
}
