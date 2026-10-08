/**
 * Simulated Sign in with Apple / Google system sheet (1.2 s, then continues). Imitates iOS
 * system UI, so it uses the system font and greys rather than product tokens. No real auth.
 */
import { useEffect } from 'react';
import { Icon, Overlay, Spinner } from '@mobile/ui';
import { simMs } from '@mobile/hooks/simTiming';
import { useLatest } from '@mobile/hooks/useLatest';
import styles from './ProviderSheet.module.css';

export type Provider = 'apple' | 'google';

export interface ProviderSheetProps {
  provider: Provider;
  email: string;
  onDone: (email: string) => void;
  onCancel: () => void;
}

export function ProviderSheet({ provider, email, onDone, onCancel }: ProviderSheetProps) {
  const done = useLatest(onDone);
  useEffect(() => {
    const id = window.setTimeout(() => done.current(email), simMs(1200));
    return () => window.clearTimeout(id);
  }, [email, done]);

  return (
    <Overlay>
      <div className={styles.scrim}>
        <div className={styles.sheet} role="dialog" aria-modal="true" aria-label={provider === 'apple' ? 'Sign in with Apple' : 'Sign in with Google'}>
          <div className={styles.head}>
            <span className={styles.brand}>
              <Icon name={provider} size={20} /> {provider === 'apple' ? 'Apple Account' : 'Google'}
            </span>
            <button type="button" className={styles.cancel} onClick={onCancel}>Cancel</button>
          </div>
          <img src="/favicon.svg" alt="" className={styles.icon} />
          <p className={styles.title}>Sign in to Your Oracle Clinician</p>
          <p className={styles.as}>
            <Spinner size={16} /> Continue as {email}
          </p>
        </div>
      </div>
    </Overlay>
  );
}
