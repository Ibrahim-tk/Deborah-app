/**
 * @screen  A-1.3 · Two-step verification
 * @flow    A1 Login
 * @states  entering · verifying · resent
 * @spec    docs/admin/README.md#a-13-two-step-verification
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { useAdminStore } from '@shared/admin';
import { Button, CodeInput } from '@admin/ui';
import { AuthLayout } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useAdminToast } from '@admin/hooks/toast.store';
import { useSim } from '@admin/hooks/useSim';
import styles from '../auth.module.css';

export default function TwoFactor() {
  const [code, setCode] = useState('');
  const email = useAdminStore((s) => s.email);
  const setAuth = useAdminNav((s) => s.setAuth);
  const toast = useAdminToast();
  const { busy, run } = useSim();

  // Prototype: any 6 digits pass.
  const verify = () => run(() => {
    useAdminStore.getState().signIn(email);
    setAuth('signIn');
  }, undefined, 900);

  return (
    <AuthLayout title="Check your email" intro={`Enter the 6-digit code we sent to ${email}. It works for 10 minutes.`}>
      <div className={styles.form}>
        {/* Standard order: code → resend line → primary action → way back. */}
        <div className={styles.codeGroup}>
          <CodeInput className={styles.code} value={code} onChange={setCode} onComplete={verify} verifying={busy} autoFocus />
          <p className={styles.footer}>
            <span>Didn't get it?</span>
            <Button variant="link" className={styles.link} onClick={() => toast('New code sent')}>Send a new code</Button>
          </p>
        </div>
        <Button fullWidth loading={busy} disabled={code.length < 6} onClick={verify}>Verify</Button>
        <Button variant="ghost" fullWidth onClick={() => setAuth('signIn')}>Back to sign in</Button>
      </div>
    </AuthLayout>
  );
}
