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
    <AuthLayout title="Enter your code" intro={`We sent a 6-digit code to ${email}.`}>
      <div className={styles.form}>
        <CodeInput value={code} onChange={setCode} onComplete={verify} disabled={busy} autoFocus />
        <Button fullWidth loading={busy} disabled={code.length < 6} onClick={verify}>Verify</Button>
        <Button variant="link" onClick={() => toast('Code sent')}>Send a new code</Button>
        <p className={styles.note}>Codes expire after 10 minutes.</p>
      </div>
    </AuthLayout>
  );
}
