/**
 * @ui CodeInput — verification code boxes on MUI Base UI `OTPField` (paste fills all, auto-advance,
 * backspace steps back, one-time-code autofill). Base UI is imported only here (CLAUDE.md rule 7).
 * Separate soft boxes, one per digit (design direction 2026-10-20): tonal fill, no outline; the active box
 * deepens a little, filled boxes stay soft.
 */
import { OTPField } from '@base-ui/react/otp-field';
import { cx } from '@shared/utils';
import styles from './CodeInput.module.css';

export interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  /** All boxes filled. */
  onComplete?: (value: string) => void;
  length?: number;
  label?: string;
  disabled?: boolean;
  /** Quiet success tint while the code is being checked. */
  verifying?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function CodeInput({ value, onChange, onComplete, length = 6, label = 'Verification code', disabled, verifying, autoFocus, className }: CodeInputProps) {
  return (
    <OTPField.Root
      className={cx(styles.root, className)}
      length={length}
      value={value}
      onValueChange={(v) => onChange(v)}
      onValueComplete={(v) => onComplete?.(v)}
      inputMode="numeric"
      autoComplete="one-time-code"
      disabled={disabled}
      aria-label={label}
      data-verifying={verifying || undefined}
    >
      {Array.from({ length }, (_, i) => (
        <OTPField.Input key={i} className={styles.slot} aria-label={`Digit ${i + 1}`} autoFocus={autoFocus && i === 0} />
      ))}
    </OTPField.Root>
  );
}
