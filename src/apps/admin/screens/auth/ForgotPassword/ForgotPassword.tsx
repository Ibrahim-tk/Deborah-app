/**
 * @screen  A-1.2 · Forgot password
 * @flow    A1 Login
 * @states  idle · sending · sent
 * @spec    docs/admin/README.md#a-12-forgot-password
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { Button, Input } from '@admin/ui';
import { AuthLayout } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import styles from '../auth.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const setAuth = useAdminNav((s) => s.setAuth);
  const { busy, run } = useSim();

  if (sent) {
    return (
      <AuthLayout title="Check your inbox">
        <div className={styles.form}>
          <p className={styles.note}>
            We've sent a password reset link to {email}. It expires in 1 hour.
          </p>
          <p className={styles.footer}>
            <span>Didn't get it?</span>
            <Button variant="link" className={styles.link} onClick={() => run(() => undefined, 'Link resent')}>Resend link</Button>
          </p>
          <Button fullWidth onClick={() => setAuth('signIn')}>Back to sign in</Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" intro="Enter your work email and we'll send you a link to set a new password.">
      <form
        className={styles.form}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (email.trim()) run(() => setSent(true));
        }}
      >
        <Input label="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" fullWidth loading={busy} disabled={!email.trim()}>Send reset link</Button>
        <Button type="button" variant="link" className={styles.link} onClick={() => setAuth('signIn')}>Back to sign in</Button>
      </form>
    </AuthLayout>
  );
}
