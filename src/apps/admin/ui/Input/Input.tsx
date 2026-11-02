/** @ui Input — Base UI Field + Input: label, hint, error, leading adornment, search pill, password reveal. */
import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Field } from '@base-ui/react/field';
import { IconButton } from '../IconButton';
import f from '../field.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'defaultValue'> {
  label: string;
  error?: string;
  hint?: string;
  hideLabel?: boolean;
  leading?: ReactNode;
  variant?: 'default' | 'search';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, hideLabel, leading, variant = 'default', type, className, ...rest },
  ref,
) {
  const [reveal, setReveal] = useState(false);
  const password = type === 'password';
  return (
    <Field.Root invalid={!!error} className={[f.root, className].filter(Boolean).join(' ')}>
      <Field.Label className={hideLabel ? f.srOnly : f.label}>{label}</Field.Label>
      <div className={f.box} data-invalid={error ? '' : undefined} data-shape={variant === 'search' ? 'pill' : undefined}>
        {leading && <span className={f.adorn}>{leading}</span>}
        <Field.Control ref={ref} {...rest} type={password && reveal ? 'text' : type} className={f.control} />
        {password && (
          <IconButton size="sm" icon={reveal ? 'eyeOff' : 'eye'} label={reveal ? 'Hide password' : 'Show password'} onClick={() => setReveal((r) => !r)} />
        )}
      </div>
      {hint && !error && <Field.Description className={f.hint}>{hint}</Field.Description>}
      {error && <Field.Error match className={f.error}>{error}</Field.Error>}
    </Field.Root>
  );
});
