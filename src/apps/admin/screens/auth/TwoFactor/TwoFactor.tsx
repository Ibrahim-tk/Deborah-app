/**
 * @screen  A-1.3 · Two-step verification
 * @flow    A1 Login (story 1.1): a code at every sign-in
 * @states  entering · verifying · wrong code · expired (10 min / 5 tries / used) · resend countdown (60 s) · resent
 * @spec    docs/admin/stories.md#11---sign-in-with-2fa
 * @xref    web: none (admin only)
 */
import { useEffect, useState } from 'react';
import { RESEND_AFTER_S, useAdminStore, useAuthSecurity } from '@shared/admin';
import { Button, CodeInput } from '@admin/ui';
import { AuthLayout } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useAdminToast } from '@admin/hooks/toast.store';
import { useSim } from '@admin/hooks/useSim';
import styles from '../auth.module.css';

export default function TwoFactor() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const email = useAdminStore((s) => s.email);
  const sentAt = useAuthSecurity((s) => s.codeSentAt);
  const setAuth = useAdminNav((s) => s.setAuth);
  const toast = useAdminToast();
  const { busy, run } = useSim();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const wait = Math.max(0, RESEND_AFTER_S - Math.floor((now - sentAt) / 1000));

  const verify = (value = code) => run(() => {
    const message = useAuthSecurity.getState().checkCode(value);
    if (message) {
      setError(message);
      setCode('');
      return;
    }
    useAdminStore.getState().signIn(email);
    setAuth('signIn');
  }, undefined, 900);

  const resend = () => {
    useAuthSecurity.getState().sendCode();
    setError('');
    setCode('');
    toast('We’ve sent you a new code.');
  };

  return (
    <AuthLayout title="Check your email" intro={`Enter the 6-digit code we sent to ${email}. It works for 10 minutes, once.`}>
      <div className={styles.form}>
        {error && <p className={styles.alert} role="alert">{error}</p>}
        <div className={styles.codeGroup}>
          <CodeInput className={styles.code} value={code} onChange={setCode} onComplete={verify} verifying={busy} autoFocus />
          <p className={styles.footer}>
            <span>Didn&rsquo;t get it?</span>
            {wait > 0 ? <span>Resend code in {wait} s</span> : <Button variant="link" className={styles.link} onClick={resend}>Resend code</Button>}
          </p>
        </div>
        <Button fullWidth loading={busy} onClick={() => verify()}>Verify</Button>
        <Button variant="ghost" fullWidth onClick={() => setAuth('signIn')}>Back to sign in</Button>
      </div>
    </AuthLayout>
  );
}
