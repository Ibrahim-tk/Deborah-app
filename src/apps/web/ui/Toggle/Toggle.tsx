/** @ui Toggle — switch; on = Deborah Purple, off = purple-100 track. Label + optional description on the left. @xref mobile: apps/mobile/ui/Toggle */
import { useId } from 'react';
import { cx } from '@shared/utils';
import styles from './Toggle.module.css';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, label, description, disabled, className }: ToggleProps) {
  const id = useId();
  const descId = `${id}-desc`;
  return (
    <div className={cx(styles.root, className)}>
      <span className={styles.text}>
        <label htmlFor={id} className={styles.label}>{label}</label>
        {description && <span id={descId} className={styles.description}>{description}</span>}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? descId : undefined}
        disabled={disabled}
        className={styles.switch}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.thumb} />
      </button>
    </div>
  );
}
