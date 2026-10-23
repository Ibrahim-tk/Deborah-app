/**
 * @pattern PillDescribeField — pill-shaped text field; no check button on web (Next / Enter confirms).
 *          Same visual language as ChipPicker “Add your own”; used when FullChoicePills
 *          morphs a describe / Yes-details option into an inline field.
 * @usedBy  FullChoicePills (describe morph); WidgetLab / DesignSystem specimens
 */
import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { Input } from '@web/ui';
import styles from './PillDescribeField.module.css';

export interface PillDescribeFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (text: string) => void;
  /** Confirm / continue (Enter). */
  onConfirm: () => void;
  disabled?: boolean;
  /** Auto-focus when mounted (typical after a pill morphs into this field). */
  autoFocus?: boolean;
  /** When true, confirm is allowed with empty text. Default requires non-whitespace. */
  allowEmpty?: boolean;
}

export function PillDescribeField({
  label,
  placeholder = 'describe your situation',
  value,
  onChange,
  onConfirm,
  disabled,
  autoFocus = true,
  allowEmpty = false,
}: PillDescribeFieldProps) {
  const fieldRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const canConfirm = allowEmpty || Boolean(value.trim());

  useEffect(() => {
    if (autoFocus) fieldRef.current?.focus();
  }, [autoFocus]);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && canConfirm) onConfirm();
    }
  };

  return (
    <div className={styles.root} data-pill-describe-field>
      <Input
        ref={fieldRef}
        id={fieldId}
        variant="inline"
        className={styles.field}
        label={label}
        hideLabel
        type="text"
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        enterKeyHint="done"
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKey}
      />
    </div>
  );
}
