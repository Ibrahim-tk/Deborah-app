/**
 * Prototype-only page lock for `/internal`. Unlock is in-memory React state — every refresh re-locks.
 * Not real authentication.
 */
import { type FormEvent, type ReactNode, useId, useState } from 'react';
import styles from './InternalGate.module.css';

const CODE = '1234';
/** Temporarily off (designer request 2026-10-20). Set back to `true` to re-enable the lock. */
const GATE_ENABLED = false;

export function InternalGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(!GATE_ENABLED);
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
        <h1 className={styles.title}>Enter the password</h1>
        <label className={styles.label} htmlFor={inputId}>
          Password
        </label>
        <input
          id={inputId}
          className={styles.input}
          name="password"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          pattern="[0-9]{4}"
          maxLength={4}
          value={digits}
          onChange={(e) => {
            setError(false);
            setDigits(e.target.value.replace(/\D/g, '').slice(0, 4));
          }}
          aria-invalid={error || undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {error && (
          <p id={`${inputId}-error`} className={styles.error} role="alert">
            Incorrect password
          </p>
        )}
        <button type="submit" className={styles.submit} disabled={digits.length !== 4}>
          Unlock
        </button>
      </form>
    </div>
  );
}
