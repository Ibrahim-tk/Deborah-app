/**
 * @ui Input — label above in subhead, 56 pt field, focus = 2 px purple border, error names the fix.
 * Password fields get a trailing eye button to show or hide what was typed.
 * Other fields may pass `trailing` for the same end slot (e.g. PhoneField’s country flag).
 */
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '@shared/utils';
import { Icon } from '../Icon';
import styles from './Input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  hint?: string;
  /** Keep the label for screen readers only, when the screen's heading already asks the question. */
  hideLabel?: boolean;
  /** Fixed prefix inside the field (e.g. phone country code). Ignored for password. */
  leading?: ReactNode;
  /** Renders in the trailing control slot (same place as the password eye). Ignored for password. */
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, hideLabel, leading, trailing, className, id, type, ...rest }, ref) {
  const autoId = useId();
  const password = type === 'password';
  const [shown, setShown] = useState(false);
  const inputId = id ?? autoId;
  const messageId = `${inputId}-msg`;
  const start = Boolean(!password && leading);
  const end = Boolean(password || trailing);
  return (
    <div className={cx(styles.root, className)}>
      <label htmlFor={inputId} className={cx(styles.label, hideLabel && styles.srOnly)}>
        {label}
      </label>
      <div className={styles.control}>
        {start && <span className={styles.leading}>{leading}</span>}
        <input
          ref={ref}
          id={inputId}
          type={password && shown ? 'text' : type}
          className={cx(styles.field, error && styles.invalid, start && styles.withLeading, end && styles.withToggle)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          {...rest}
        />
        {password ? (
          <button type="button" className={styles.toggle} aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown} onClick={() => setShown((v) => !v)}>
            <Icon name={shown ? 'eyeOff' : 'eye'} size={20} />
          </button>
        ) : (
          trailing
        )}
      </div>
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