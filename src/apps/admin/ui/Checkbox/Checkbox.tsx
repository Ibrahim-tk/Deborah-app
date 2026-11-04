/** @ui Checkbox — Base UI Checkbox: a circle with a check. Label optional (kept for screen readers). */
import { Checkbox as Base } from '@base-ui/react/checkbox';
import { Icon } from '../Icon';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hideLabel?: boolean;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, hideLabel, disabled }: CheckboxProps) {
  return (
    <label className={styles.root} data-disabled={disabled || undefined}>
      <Base.Root checked={checked} disabled={disabled} onCheckedChange={(v) => onChange(v)} className={styles.box} aria-label={hideLabel ? label : undefined}>
        <Base.Indicator className={styles.indicator}><Icon name="check" size={14} /></Base.Indicator>
      </Base.Root>
      {!hideLabel && <span className={styles.label}>{label}</span>}
    </label>
  );
}
