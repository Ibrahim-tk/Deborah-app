/** @ui Input — label above in subhead, 56 pt field, focus = 2 px purple border, error names the fix. */
import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cx } from '@shared/utils';
import { Icon } from '../Icon';
import styles from './Input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, className, id, ...rest }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-msg`;
  return (
    <div className={cx(styles.root, className)}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={cx(styles.field, error && styles.invalid)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        {...rest}
      />
      {error ? (
        <p id={messageId} className={styles.error} role="alert">
          <Icon name="alert" size={18} /> {error}
        </p>
      ) : (
        hint && <p id={messageId} className={styles.hint}>{hint}</p>
      )}
    </div>
  );
});
