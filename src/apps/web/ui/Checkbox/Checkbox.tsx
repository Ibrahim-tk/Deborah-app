/** @ui Checkbox — 22 px box, whole row clickable; label may contain links. @xref mobile: apps/mobile/ui/Checkbox */
import { useId, type ReactNode } from 'react';
import { cx } from '@shared/utils';
import { Icon } from '../Icon';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onChange, label, description, disabled, className }: CheckboxProps) {
  const id = useId();
  return (
    <div className={cx(styles.root, className)} data-disabled={disabled || undefined}>
      <input id={id} type="checkbox" className={styles.input} checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id} className={styles.row}>
        <span className={styles.box} data-checked={checked} aria-hidden="true">
          {checked && <Icon name="check" size={16} strokeWidth={2} />}
        </span>
        <span className={styles.text}>
          <span className={styles.label}>{label}</span>
          {description && <span className={styles.description}>{description}</span>}
        </span>
      </label>
    </div>
  );
}
