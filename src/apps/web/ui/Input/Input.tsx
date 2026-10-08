/** @ui Input — label above (subhead, Plum Secondary), 44 px field, focus = 2 px purple border, error names the fix. @xref mobile: apps/mobile/ui/Input */
import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cx } from '@shared/utils';
import { Icon } from '../Icon';
import styles from './Input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  /** Visually hide the label (still announced). */
  hideLabel?: boolean;
  error?: string;
  hint?: string;
  size?: 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hideLabel, error, hint, size = 'md', className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-msg`;
  return (
    <div className={cx(styles.root, className)}>
      <label htmlFor={inputId} className={cx(styles.label, hideLabel && 'sr-only')}>
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={cx(styles.field, styles[size], error && styles.invalid)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        {...rest}
      />
      {error ? (
        <p id={messageId} className={styles.error} role="alert">
          <Icon name="alert" size={16} /> {error}
        </p>
      ) : (
        hint && <p id={messageId} className={styles.hint}>{hint}</p>
      )}
    </div>
  );
});
