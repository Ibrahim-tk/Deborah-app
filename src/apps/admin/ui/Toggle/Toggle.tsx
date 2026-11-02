/** @ui Toggle — Base UI Switch with a label and optional description beside it. */
import { useId } from 'react';
import { Switch } from '@base-ui/react/switch';
import styles from './Toggle.module.css';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  const id = useId();
  return (
    <div className={styles.root}>
      <Switch.Root id={id} checked={checked} disabled={disabled} onCheckedChange={(v) => onChange(v)} className={styles.switch}>
        <Switch.Thumb className={styles.thumb} />
      </Switch.Root>
      <label htmlFor={id} className={styles.text}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </label>
    </div>
  );
}
