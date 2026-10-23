/**
 * @part ForgotPassword — M-1.4 sign-in's "Forgot password?" flow, same full-screen steps.
 * Stages: email → 6-digit code sent to that email (any digits verify, simulated) → new password + confirm
 * → "Your password is set" → hands back to CreateProfile, which signs her in (auto-login → Home).
 * No backend: nothing is sent or stored beyond the client store (CLAUDE.md non-negotiable 1).
 * OPEN: placeholder UX copy until reviewed.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { Button, Icon, Input, TextReveal } from '@web/ui';
import { CodeStep } from '@web/screens/plans/CreateAccount/parts/CodeStep';
import shared from '../../CreateProfile.module.css';
import styles from './ForgotPassword.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_LENGTH = 8;
const SET_MS = 1600;
/** TEMP: skip signup/signin field checks for manual journey testing. Set `true` only while testing. */
const SKIP_AUTH_VALIDATION = true;

type Stage = 'email' | 'code' | 'password' | 'set';

export interface ForgotPasswordProps {
  /** Prefills the email she already typed on the sign-in form. */
  initialEmail: string;
  onCancel: () => void;
  /** Password renewed: sign her in with this email. */
  onComplete: (email: string) => void;
}

const HEADERS: Record<Stage, { title?: string; subtitle?: string }> = {
  email: { title: 'Reset your password', subtitle: 'Enter your email and I’ll send you a code.' },
  code: { title: 'Check your email' },
  password: { title: 'Choose a new password', subtitle: `At least ${MIN_LENGTH} characters.` },
  set: {},
};

export function ForgotPassword({ initialEmail, onCancel, onComplete }: ForgotPasswordProps) {
  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});
  const header = HEADERS[stage];

  const sendCode = (e: FormEvent) => {
    e.preventDefault();
    if (SKIP_AUTH_VALIDATION) {
      setErrors({});
      setStage('code');
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) return setErrors({ email: 'That email doesn’t look quite right.' });
    setStage('code');
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (SKIP_AUTH_VALIDATION) {
      setErrors({});
      setStage('set');
      return;
    }
    const next = {
      password: password.length >= MIN_LENGTH ? undefined : `Use at least ${MIN_LENGTH} characters.`,
      confirm: password === confirm ? undefined : 'Those passwords don’t match.',
    };
    setErrors(next);
    if (!next.password && !next.confirm) setStage('set');
  };

  // "Your password is set" holds briefly, then she is signed in.
  useEffect(() => {
    if (stage !== 'set') return;
    const id = window.setTimeout(() => onComplete(email.trim()), SET_MS);
    return () => window.clearTimeout(id);
  }, [stage, email, onComplete]);

  return (
    <>
      {header.title && (
        <header className={shared.header}>
          <TextReveal as="h1" className={shared.prompt} text={header.title} delay={200} />
          {header.subtitle && <TextReveal className={shared.lede} text={header.subtitle} delay={500} />}
        </header>
      )}
      {stage === 'email' && (
        <form key="email" className={shared.fields} onSubmit={sendCode} noValidate>
          <Input label="Email" type="email" placeholder="Your email" value={email} autoComplete="email" inputMode="email" error={errors.email} onChange={(e) => { setEmail(e.target.value); setErrors({}); }} />
          <Button type="submit" fullWidth disabled={SKIP_AUTH_VALIDATION ? false : !email}>Send code</Button>
          <Button variant="link" className={styles.back} onClick={onCancel}>Back to sign in</Button>
        </form>
      )}
      {stage === 'code' && (
        <div key="code" className={shared.code}>
          <CodeStep email={email.trim()} onChangeEmail={() => setStage('email')} onVerified={() => setStage('password')} />
        </div>
      )}
      {stage === 'password' && (
        <form key="password" className={shared.fields} onSubmit={save} noValidate>
          <Input label="New password" type="password" placeholder="Enter a new password" value={password} autoComplete="new-password" error={errors.password} onChange={(e) => { setPassword(e.target.value); setErrors((x) => ({ ...x, password: undefined })); }} />
          <Input label="Confirm new password" type="password" placeholder="Confirm your new password" value={confirm} autoComplete="new-password" enterKeyHint="go" error={errors.confirm} onChange={(e) => { setConfirm(e.target.value); setErrors((x) => ({ ...x, confirm: undefined })); }} />
          <Button type="submit" fullWidth disabled={SKIP_AUTH_VALIDATION ? false : !password || !confirm}>Update password</Button>
        </form>
      )}
      {stage === 'set' && (
        <div key="set" className={shared.done} role="status">
          <span className={shared.check}><Icon name="check" size={32} /></span>
          <TextReveal as="h2" className={shared.title} text="Your password is set." delay={200} />
          <TextReveal className={shared.sub} text="Signing you in…" delay={500} />
        </div>
      )}
    </>
  );
}
