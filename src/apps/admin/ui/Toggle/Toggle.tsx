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
  /** Switch only; the label is kept for screen readers (e.g. under a column heading). */
  hideLabel?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled, hideLabel }: ToggleProps) {
  const id = useId();
  return (
    <div className={styles.root} data-bare={hideLabel || undefined}>
      <Switch.Root id={id} checked={checked} disabled={disabled} aria-label={hideLabel ? label : undefined} onCheckedChange={(v) => onChange(v)} className={styles.switch}>
        <Switch.Thumb className={styles.thumb} />
      </Switch.Root>
      {!hideLabel && (
        <label htmlFor={id} className={styles.text}>
          <span className={styles.label}>{label}</span>
          {description && <span className={styles.description}>{description}</span>}
        </label>
      )}
    </div>
  );
}
