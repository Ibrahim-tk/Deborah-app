/**
 * @screen  A-1.1 · Sign in
 * @flow    A1 Login
 * @states  idle · submitting · error (empty fields)
 * @spec    docs/admin/README.md#a-11-sign-in
 * @xref    web: none (admin only)
 */
import { useState, type FormEvent } from 'react';
import { useAdminStore } from '@shared/admin';
import { Button, Input } from '@admin/ui';
import { AuthLayout } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import styles from '../auth.module.css';

export default function SignIn() {
  const [email, setEmail] = useState(useAdminStore.getState().email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setAuth = useAdminNav((s) => s.setAuth);
  const { busy, run } = useSim();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return setError('Enter your work email and password to continue.');
    setError('');
    // Prototype: any password passes. Real auth is out of scope (CLAUDE.md §1).
    run(() => {
      useAdminStore.setState({ email: email.trim() });
      setAuth('twoFactor');
    });
  };

  return (
    <AuthLayout title="Welcome back" intro="Sign in with the work email your invite was sent to.">
      <form className={styles.form} onSubmit={submit} noValidate>
        <Input label="Work email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          error={error || undefined}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" fullWidth loading={busy}>Sign in</Button>
        <Button type="button" variant="link" className={styles.link} onClick={() => setAuth('forgot')}>Forgot your password?</Button>
      </form>
    </AuthLayout>
  );
}
