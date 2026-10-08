/**
 * @ui   TextArea — auto-grows between minRows and maxRows. `field` variant: label above + bordered box
 *       (forms, note editor). `bare` variant: unboxed text for a container that draws its own surface
 *       (the composer). Optional character counter from `counterFrom` characters.
 * @xref mobile: apps/mobile/ui/TextArea
 */
import { forwardRef, useId, useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react';
import { cx } from '@shared/utils';
import { Icon } from '../Icon';
import styles from './TextArea.module.css';

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value'> {
  label: string;
  /** Visually hide the label (still announced). Bare text areas always hide it. */
  hideLabel?: boolean;
  value: string;
  minRows?: number;
  maxRows?: number;
  variant?: 'field' | 'bare';
  error?: string;
  hint?: string;
  /** Show "n / maxLength" once the value reaches this many characters (needs maxLength). */
  counterFrom?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, hideLabel, value, minRows = 1, maxRows = 6, variant = 'field', error, hint, counterFrom, maxLength, className, id, ...rest },
  ref,
) {
  const inner = useRef<HTMLTextAreaElement | null>(null);
  const autoId = useId();
  const fieldId = id ?? autoId;
  const messageId = `${fieldId}-msg`;

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const line = parseFloat(cs.lineHeight) || 26;
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    el.style.height = 'auto';
    const content = el.scrollHeight;
    el.style.height = `${Math.min(Math.max(content, line * minRows + pad), line * maxRows + pad)}px`;
  }, [value, minRows, maxRows]);

  const showCounter = counterFrom !== undefined && maxLength !== undefined && value.length >= counterFrom;
  const bare = variant === 'bare';

  return (
    <div className={cx(styles.root, className)}>
      <label htmlFor={fieldId} className={cx(styles.label, (hideLabel || bare) && 'sr-only')}>
        {label}
      </label>
      <textarea
        ref={(el) => {
          inner.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        id={fieldId}
        rows={minRows}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        className={cx(styles.field, bare ? styles.bare : styles.boxed, error && styles.invalid)}
        {...rest}
      />
      {(error || hint || showCounter) && (
        <div className={styles.meta}>
          {error ? (
            <p id={messageId} className={styles.error} role="alert">
              <Icon name="alert" size={16} /> {error}
            </p>
          ) : (
            hint && <p id={messageId} className={styles.hint}>{hint}</p>
          )}
          {showCounter && (
            <span className={styles.counter} aria-live="polite">
              {value.length} / {maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
});
