/**
 * @screen  A-1.2 · Forgot password
 * @flow    A1 Login (story 1.2)
 * @states  request (required / format errors) · link sent (same message either way) · reset (rules, match, strength) · done
 * @spec    docs/admin/stories.md#12---forget-password
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { PASSWORD_RULES, PASSWORD_RULES_ERROR, meetsPasswordRules, useAdminStore, useAuthSecurity } from '@shared/admin';
import { Button, Icon, Input } from '@admin/ui';
import { AuthLayout } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import styles from '../auth.module.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [step, setStep] = useState<'request' | 'sent' | 'reset'>('request');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState(false);
  const setAuth = useAdminNav((s) => s.setAuth);
  const { busy, run } = useSim();
  const met = PASSWORD_RULES.filter((r) => r.test(next)).length;

  if (step === 'sent') {
    return (
      <AuthLayout title="Check your inbox">
        <div className={styles.form}>
          {/* Same message whether or not the email is registered, so nobody can find out which emails have an account. */}
          <p className={styles.note}>If an account exists for this email, we&rsquo;ve sent a link to reset your password. It works once, for 60 minutes.</p>
          <Button fullWidth onClick={() => setStep('reset')}>Open the reset link</Button>
          <Button variant="ghost" fullWidth onClick={() => setAuth('signIn')}>Back to sign in</Button>
          <p className={styles.hint}>Prototype: &ldquo;Open the reset link&rdquo; stands in for the email.</p>
        </div>
      </AuthLayout>
    );
  }

  if (step === 'reset') {
    const ruleError = touched && !next ? 'Please enter a new password.' : touched && !meetsPasswordRules(next) ? PASSWORD_RULES_ERROR : undefined;
    const matchError = touched && confirm !== next ? 'The passwords don’t match.' : undefined;
    const save = () => {
      setTouched(true);
      if (!meetsPasswordRules(next) || confirm !== next) return;
      run(() => {
        // Ends open sessions, removes any temporary lock, and emails a confirmation.
        useAuthSecurity.getState().unlock();
        useAdminStore.getState().log('Password reset');
        setAuth('signIn');
      }, 'Your password has been reset. Please sign in.');
    };
    return (
      <AuthLayout title="Set a new password">
        <div className={styles.form}>
          <Input label="New password" type="password" autoComplete="new-password" value={next} error={ruleError} onChange={(e) => setNext(e.target.value)} />
          <div className={styles.strength} data-level={met} aria-label={`Password strength ${met} of ${PASSWORD_RULES.length}`}><span /></div>
          <ul className={styles.rules}>
            {PASSWORD_RULES.map((r) => (
              <li key={r.id} className={styles.rule} data-met={r.test(next) || undefined}><Icon name="check" size={14} />{r.label}</li>
            ))}
          </ul>
          <Input label="Confirm new password" type="password" autoComplete="new-password" value={confirm} error={matchError} onChange={(e) => setConfirm(e.target.value)} />
          <Button fullWidth loading={busy} onClick={save}>Reset password</Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" intro="Enter your email and we'll send you a link to set a new password.">
      <form
        className={styles.form}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const err = !email.trim() ? 'Email is required.' : !EMAIL.test(email.trim()) ? 'Please enter a valid email address.' : '';
          setEmailError(err);
          if (!err) run(() => { useAdminStore.getState().log(`Password reset requested for ${email.trim()}`); setStep('sent'); });
        }}
      >
        <Input label="Email" type="email" value={email} error={emailError || undefined} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" fullWidth loading={busy}>Send reset link</Button>
        <Button type="button" variant="link" className={styles.link} onClick={() => setAuth('signIn')}>Back to sign in</Button>
      </form>
    </AuthLayout>
  );
}
