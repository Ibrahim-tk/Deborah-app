/** @ui Toggle — iOS switch geometry; on = Deborah Purple, off = purple-100 track. */
import { useId } from 'react';
import styles from './Toggle.module.css';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  const id = useId();
  return (
    <div className={styles.root}>
      <span className={styles.text}>
        <label htmlFor={id} className={styles.label}>{label}</label>
        {description && <span className={styles.description}>{description}</span>}
      </span>
      <button id={id} type="button" role="switch" aria-checked={checked} className={styles.switch} onClick={() => onChange(!checked)}>
        <span className={styles.thumb} />
      </button>
    </div>
  );
}
