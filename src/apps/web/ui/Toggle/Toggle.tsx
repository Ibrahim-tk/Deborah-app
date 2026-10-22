/** @ui Toggle — iOS switch geometry; on = Deborah Purple, off = purple-100 track. */
import { useId } from 'react';
import styles from './Toggle.module.css';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  /** Locked (e.g. required notifications that can't be turned off). */
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  const id = useId();
  return (
    <div className={styles.root}>
      <span className={styles.text}>
        <label htmlFor={id} className={styles.label}>{label}</label>
        {description && <span className={styles.description}>{description}</span>}
      </span>
      <button id={id} type="button" role="switch" aria-checked={checked} className={styles.switch} disabled={disabled} onClick={() => onChange(!checked)}>
        <span className={styles.thumb} />
      </button>
    </div>
  );
}
