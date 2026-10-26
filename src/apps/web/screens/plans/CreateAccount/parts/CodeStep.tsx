/**
 * Verification code on the shared ui/CodeInput (Base UI OTPField): 6 boxes in two groups of three, auto-advance,
 * paste fills all, any code accepted, resend after 30 s. Filled boxes take a soft lilac fill; focus is a neutral border.
 */
import { useEffect, useState } from 'react';
import { Button, CodeInput, IconButton, ProgressStatus } from '@web/ui';
import { useToast } from '@web/hooks/toast.store';
import { simMs } from '@web/hooks/simTiming';
import { useLatest } from '@web/hooks/useLatest';
import styles from './CodeStep.module.css';

/** Shown when sign-up checks are skipped for testing and no email was typed. */
const TEST_EMAIL = 'tester@example.com';
const LENGTH = 6;
const RESEND_S = 30;

export function CodeStep({ email, onVerified, onChangeEmail }: { email: string; onVerified: () => void; onChangeEmail?: () => void }) {
  const toast = useToast();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [wait, setWait] = useState(RESEND_S);
  const verified = useLatest(onVerified);

  const update = (next: string) => {
    setCode(next);
    if (next.length === LENGTH) setVerifying(true);
  };

  useEffect(() => {
    if (wait <= 0) return;
    const id = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(id);
  }, [wait]);

  // PDF persona auto-run: fill OTP immediately when the shell sets data-yoc-fast-signup.
  useEffect(() => {
    if (document.documentElement.dataset.yocFastSignup !== '1') return;
    update('4'.repeat(LENGTH));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot on mount for journey pilot
  }, []);

  useEffect(() => {
    if (!verifying) return;
    const fast = document.documentElement.dataset.yocFastSignup === '1';
    const id = window.setTimeout(() => verified.current(), fast ? 700 : simMs(900));
    return () => window.clearTimeout(id);
  }, [verifying, verified]);

  return (
    <div className={styles.root}>
      <p className={styles.text}>
        We’ve sent a 6-digit verification code to
        <span className={styles.emailRow}>
          <span className={styles.email}>{email || TEST_EMAIL}</span>
          {onChangeEmail && !verifying && (
            <IconButton icon="edit" size="sm" label="Change email" className={styles.change} onClick={onChangeEmail} />
          )}
        </span>
      </p>
      <CodeInput value={code} onChange={update} length={LENGTH} disabled={verifying} verifying={verifying} autoFocus />
      <div className={styles.foot}>
        {verifying ? (
          <ProgressStatus label="Verifying" />
        ) : wait > 0 ? (
          <p className={styles.resend}>Didn’t get it? Resend in 0:{String(wait).padStart(2, '0')}</p>
        ) : (
          <Button
            variant="link"
            onClick={() => {
              setWait(RESEND_S);
              toast('Code has been sent', { icon: 'check' });
            }}
          >
            Resend code
          </Button>
        )}
      </div>
    </div>
  );
}
