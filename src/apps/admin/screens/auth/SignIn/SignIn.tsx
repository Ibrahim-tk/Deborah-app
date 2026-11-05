/**
 * @screen  A-1.1 · Sign in
 * @flow    A1 Login (story 1.1)
 * @states  idle · submitting · required / format errors · wrong credentials · locked (3 attempts) · signed out after inactivity
 * @spec    docs/admin/stories.md#11---sign-in-with-2fa
 * @xref    web: none (admin only)
 */
import { useState, type FormEvent } from 'react';
import { AUTH_COPY, useAdminStore, useAuthSecurity } from '@shared/admin';
import { Button, Input } from '@admin/ui';
import { AuthLayout } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import styles from '../auth.module.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  const [email, setEmail] = useState(useAdminStore.getState().email);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const locked = useAuthSecurity((s) => s.locked);
  const notice = useAuthSecurity((s) => s.notice);
  const setAuth = useAdminNav((s) => s.setAuth);
  const { busy, run } = useSim();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = {
      email: !email.trim() ? 'Email is required.' : !EMAIL.test(email.trim()) ? 'Please enter a valid email address.' : undefined,
      password: !password ? 'Password is required.' : undefined,
    };
    setErrors(next);
    if (next.email || next.password) return;
    run(() => {
      const error = useAuthSecurity.getState().checkPassword(email.trim(), password);
      if (error) return setErrors({ form: error });
      useAuthSecurity.getState().clearNotice();
      useAuthSecurity.getState().sendCode();
      useAdminStore.setState({ email: email.trim() });
      setAuth('twoFactor');
    });
  };

  return (
    <AuthLayout title="Welcome back" intro="Sign in with the work email your invite was sent to.">
      <form className={styles.form} onSubmit={submit} noValidate>
        {notice && <p className={styles.notice}>{notice}</p>}
        {(errors.form || locked) && <p className={styles.alert} role="alert">{locked ? AUTH_COPY.locked : errors.form}</p>}
        <Input label="Email" type="email" autoComplete="username" value={email} error={errors.email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" autoComplete="current-password" value={password} error={errors.password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" fullWidth loading={busy} disabled={locked}>Sign in</Button>
        <Button type="button" variant="link" className={styles.link} onClick={() => setAuth('forgot')}>Forgot your password?</Button>
        <p className={styles.hint}>Prototype: any password signs in; type &ldquo;wrong&rdquo; to see the error and the lock after 3 tries.</p>
      </form>
    </AuthLayout>
  );
}
