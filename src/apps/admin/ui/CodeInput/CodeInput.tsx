/** @ui CodeInput — Base UI OTPField: one box per digit, paste and autofill handled by Base UI. */
import { OTPField } from '@base-ui/react/otp-field';
import styles from './CodeInput.module.css';

export interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  label?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function CodeInput({ value, onChange, onComplete, length = 6, label = 'Verification code', disabled, autoFocus }: CodeInputProps) {
  return (
    <OTPField.Root
      length={length}
      value={value}
      onValueChange={(v) => onChange(v)}
      onValueComplete={(v) => onComplete?.(v)}
      disabled={disabled}
      aria-label={label}
      className={styles.root}
    >
      {Array.from({ length }, (_, i) => (
        <OTPField.Input key={i} className={styles.cell} autoFocus={autoFocus && i === 0} />
      ))}
    </OTPField.Root>
  );
}
