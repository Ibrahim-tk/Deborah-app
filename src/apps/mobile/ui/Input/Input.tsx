/**
 * @ui Input — label above in subhead, 48 pt field, focus = darker neutral border, error names the fix.
 * Password fields get a trailing eye button to show or hide what was typed.
 * Other fields may pass `trailing` for the same end slot (e.g. PhoneField’s country flag).
 *
 * Adapter: built on MUI Base UI `Field` (unstyled; our CSS Modules + tokens). Base UI is imported only
 * here (CLAUDE.md rule 7), so screens keep `Input` from `@mobile/ui` with the same props.
 * `USE_BASE_UI = false` restores the hand-built field for one iteration while we roll out.
 *
 * variant: 'default' · 'search' (pill + leading search icon) · 'inline' (borderless, inside a pill / chip / chat
 * answer whose host draws the shape). Focus is a darker neutral border everywhere (no purple ring).
 */
import { forwardRef, useId, useLayoutEffect, useRef, useState, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react';
import { Field } from '@base-ui/react/field';
import { cx } from '@shared/utils';
import { Icon } from '../Icon';
import styles from './Input.module.css';

const USE_BASE_UI = true;

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
  variant?: 'default' | 'search' | 'inline';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, hideLabel, leading, trailing, variant = 'default', className, id, type, ...rest }, ref) {
  const autoId = useId();
  const password = type === 'password';
  const [shown, setShown] = useState(false);
  const inputId = id ?? autoId;
  const messageId = `${inputId}-msg`;
  const start = Boolean(!password && leading);
  const end = Boolean(password || trailing);
  const fieldClass = cx(styles.field, error && styles.invalid, start && styles.withLeading, end && styles.withToggle);
  // The prefix (e.g. a dial code) gets exactly its own measured width, then a normal word space.
  const leadRef = useRef<HTMLSpanElement>(null);
  const [leadW, setLeadW] = useState<number>();
  useLayoutEffect(() => {
    if (start) setLeadW(leadRef.current?.offsetWidth);
  }, [start, leading]);
  const leadingStyle = start && leadW ? ({ '--leading-w': `${leadW}px` } as CSSProperties) : undefined;
  const endSlot = password ? (
    <button type="button" className={styles.toggle} aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown} onClick={() => setShown((v) => !v)}>
      <Icon name={shown ? 'eyeOff' : 'eye'} size={20} />
    </button>
  ) : (
    trailing
  );

  if (USE_BASE_UI) {
    return (
      <Field.Root className={cx(styles.root, variant !== 'default' && styles[variant], className)} invalid={Boolean(error)} disabled={rest.disabled}>
        <Field.Label className={cx(styles.label, hideLabel && styles.srOnly)}>{label}</Field.Label>
        <div className={styles.control}>
          {variant === 'search' && (
            <span className={styles.searchIcon} aria-hidden>
              <Icon name="search" size={18} />
            </span>
          )}
          {start && <span ref={leadRef} className={styles.leading}>{leading}</span>}
          <Field.Control ref={ref} id={inputId} type={password && shown ? 'text' : type} className={fieldClass} style={leadingStyle} {...rest} />
          {endSlot}
        </div>
        {error ? (
          <Field.Error match className={styles.error} role="alert">
            <Icon name="alert" size={18} /> {error}
          </Field.Error>
        ) : (
          hint && <Field.Description className={styles.hint}>{hint}</Field.Description>
        )}
      </Field.Root>
    );
  }

  return (
    <div className={cx(styles.root, className)}>
      <label htmlFor={inputId} className={cx(styles.label, hideLabel && styles.srOnly)}>
        {label}
      </label>
      <div className={styles.control}>
        {start && <span ref={leadRef} className={styles.leading}>{leading}</span>}
        <input
          ref={ref}
          id={inputId}
          type={password && shown ? 'text' : type}
          className={fieldClass}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          {...rest}
        />
        {endSlot}
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
