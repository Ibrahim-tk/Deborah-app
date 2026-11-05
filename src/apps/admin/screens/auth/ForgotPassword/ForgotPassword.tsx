/**
 * @screen  A-1.2 · Forgot password
 * @flow    A1 Login (story 1.2)
 * @states  request (required / format errors) · link sent (same message either way) · link expired or used · reset (rules, match, reuse, strength) · done
 * @spec    docs/admin/stories.md#12---forget-password
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { AUTH_COPY, PASSWORD_RULES, PASSWORD_RULES_ERROR, meetsPasswordRules, useAdminSettings, useAdminStore, useAuthSecurity } from '@shared/admin';
import { Button, Icon, Input } from '@admin/ui';
import { AuthLayout } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import styles from '../auth.module.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [step, setStep] = useState<'request' | 'sent' | 'expired' | 'reset'>('request');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState(false);
  const setAuth = useAdminNav((s) => s.setAuth);
  const { busy, run } = useSim();
  const linkId = useAuthSecurity((st) => st.resetLink.id);

  // Prototype: opening a link checks expiry (60 min), single use, and that no newer link was sent.
  const openLink = (id: number) => setStep(useAuthSecurity.getState().openResetLink(id) ? 'expired' : 'reset');
  const sendLink = () => {
    useAuthSecurity.getState().requestReset();
    useAdminStore.getState().log(`Password reset requested for ${email.trim()}`);
    setStep('sent');
  };

  if (step === 'expired') {
    return (
      <AuthLayout title="Link expired">
        <div className={styles.form}>
          <p className={styles.alert} role="alert">{AUTH_COPY.linkExpired}</p>
          <Button fullWidth loading={busy} onClick={() => run(sendLink)}>Send a new link</Button>
          <Button variant="ghost" fullWidth onClick={() => setAuth('signIn')}>Back to sign in</Button>
        </div>
      </AuthLayout>
    );
  }

  if (step === 'sent') {
    return (
      <AuthLayout title="Check your inbox">
        <div className={styles.form}>
          {/* Same message whether or not the email is registered, so nobody can find out which emails have an account. */}
          <p className={styles.note}>If an account exists for this email, we&rsquo;ve sent a link to reset your password. It works once, for 60 minutes.</p>
          <Button fullWidth onClick={() => openLink(linkId)}>Open the reset link</Button>
          {/* Prototype: shows that sending again cancels the earlier link. */}
          <Button variant="secondary" fullWidth loading={busy} onClick={() => run(sendLink, 'We’ve sent a new link. The earlier one no longer works.')}>Send a new link</Button>
          {linkId > 1 && <Button variant="ghost" fullWidth onClick={() => openLink(linkId - 1)}>Open the earlier link</Button>}
          <Button variant="ghost" fullWidth onClick={() => setAuth('signIn')}>Back to sign in</Button>
        </div>
      </AuthLayout>
    );
  }

  if (step === 'reset') {
    const current = useAuthSecurity.getState().password;
    const reused = !!current && next === current;
    const ruleError = touched && !next ? 'Please enter a new password.' : touched && !meetsPasswordRules(next) ? PASSWORD_RULES_ERROR : touched && reused ? AUTH_COPY.reused : undefined;
    const matchError = touched && confirm !== next ? 'The passwords don’t match.' : undefined;
    const save = () => {
      setTouched(true);
      if (!meetsPasswordRules(next) || confirm !== next || reused) return;
      run(() => {
        // Uses up the link, ends open sessions, removes any temporary lock, and emails a confirmation.
        useAuthSecurity.getState().setPassword(next, true);
        useAuthSecurity.getState().unlock();
        useAdminSettings.setState((st) => ({ sessions: st.sessions.filter((x) => x.current) }));
        useAdminStore.getState().log('Password reset');
        setAuth('signIn');
      }, 'Your password has been reset. Please sign in.');
    };
    return (
      <AuthLayout title="Set a new password">
        <div className={styles.form}>
          {/* Rules first, in their own panel, so they're read before typing. */}
          <div className={styles.rulesBox}>
            <p className={styles.rulesTitle}>Your password needs</p>
            <ul className={styles.rules}>
              {PASSWORD_RULES.map((r) => (
                <li key={r.id} className={styles.rule} data-met={r.test(next) || undefined}><Icon name="check" size={14} />{r.label}</li>
              ))}
            </ul>
          </div>
          <Input label="New password" type="password" autoComplete="new-password" value={next} error={ruleError} onChange={(e) => setNext(e.target.value)} />
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
          if (!err) run(sendLink);
        }}
      >
        <Input label="Email" type="email" value={email} error={emailError || undefined} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" fullWidth loading={busy}>Send reset link</Button>
        <Button type="button" variant="link" className={styles.link} onClick={() => setAuth('signIn')}>Back to sign in</Button>
      </form>
    </AuthLayout>
  );
}
