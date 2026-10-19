/**
 * @ui TextArea — auto-growing between minRows and maxRows; optional character counter.
 * Adapter: wrapped in MUI Base UI `Field` (unstyled), same props. `USE_BASE_UI = false` restores the plain textarea.
 */
import { forwardRef, useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react';
import { Field } from '@base-ui/react/field';
import { cx } from '@shared/utils';
import styles from './TextArea.module.css';

const USE_BASE_UI = true;

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Accessible label (visually hidden when the context makes it clear). */
  label: string;
  minRows?: number;
  maxRows?: number;
  value: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, minRows = 1, maxRows = 5, className, value, ...rest },
  ref,
) {
  const inner = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const line = parseFloat(getComputedStyle(el).lineHeight) || 30;
    el.style.height = 'auto';
    // When empty, size to the placeholder so a long hint is never clipped.
    let content = el.scrollHeight;
    if (!value && el.placeholder) {
      el.value = el.placeholder;
      content = el.scrollHeight;
      el.value = '';
    }
    el.style.height = `${Math.min(Math.max(content, line * minRows), line * maxRows)}px`;
  }, [value, minRows, maxRows, rest.placeholder]);

  const setRef = (el: HTMLTextAreaElement | null) => {
    inner.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };
  const area = (
    <textarea ref={setRef} aria-label={label} rows={minRows} value={value} className={cx(styles.root, className)} {...rest} />
  );

  if (USE_BASE_UI) {
    return (
      <Field.Root className={styles.field} disabled={rest.disabled}>
        <Field.Control render={area} />
      </Field.Root>
    );
  }

  return area;
});
