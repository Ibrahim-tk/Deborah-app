/**
 * Prototype-only page lock for `/internal`. Unlock is in-memory React state — every refresh re-locks.
 * Not real authentication.
 */
import { type FormEvent, type ReactNode, useId, useState } from 'react';
import styles from './InternalGate.module.css';

const CODE = '001001';

export function InternalGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [digits, setDigits] = useState('');
  const [error, setError] = useState(false);
  const inputId = useId();

  if (unlocked) return children;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (digits === CODE) {
      setError(false);
      setUnlocked(true);
      return;
    }
    setError(true);
    setDigits('');
  };

  return (
    <div className={styles.root}>
      <form className={styles.card} onSubmit={submit}>
        <h1 className={styles.title}>Internal tools</h1>
        <p className={styles.lede}>Enter the six-digit access code to continue.</p>
        <label className={styles.label} htmlFor={inputId}>
          Access code
        </label>
        <input
          id={inputId}
          className={styles.input}
          name="code"
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          value={digits}
          onChange={(e) => {
            setError(false);
            setDigits(e.target.value.replace(/\D/g, '').slice(0, 6));
          }}
          aria-invalid={error || undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {error && (
          <p id={`${inputId}-error`} className={styles.error} role="alert">
            Incorrect code
          </p>
        )}
        <button type="submit" className={styles.submit} disabled={digits.length !== 6}>
          Unlock
        </button>
      </form>
    </div>
  );
}
