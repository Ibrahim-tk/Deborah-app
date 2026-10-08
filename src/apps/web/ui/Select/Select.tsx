/**
 * @ui   Select — a styled native <select> (label above, 44 px field, chevron). Native keeps full keyboard
 *       and screen-reader support for free. ASSUMPTION: native list styling is acceptable on desktop.
 * @xref mobile: apps/mobile/ui/Select (inline option-row picker)
 */
import { useId } from 'react';
import { cx } from '@shared/utils';
import { Icon } from '../Icon';
import styles from './Select.module.css';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T extends string> {
  label: string;
  hideLabel?: boolean;
  options: SelectOption<T>[];
  value?: T;
  /** Shown as a disabled first option while nothing is chosen. */
  placeholder?: string;
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select<T extends string>({ label, hideLabel, options, value, placeholder = 'Choose…', onChange, error, disabled, className }: SelectProps<T>) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div className={cx(styles.root, className)}>
      <label htmlFor={id} className={cx(styles.label, hideLabel && 'sr-only')}>{label}</label>
      <span className={styles.wrap}>
        <select
          id={id}
          className={cx(styles.field, !value && styles.empty, error && styles.invalid)}
          value={value ?? ''}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? msgId : undefined}
          onChange={(e) => onChange(e.target.value as T)}
        >
          {!value && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" size={18} className={styles.chevron} />
      </span>
      {error && (
        <p id={msgId} className={styles.error} role="alert">
          <Icon name="alert" size={16} /> {error}
        </p>
      )}
    </div>
  );
}
